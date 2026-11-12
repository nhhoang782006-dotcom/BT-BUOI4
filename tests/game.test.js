"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { CLASS_PROFILES, createHero, resolveAttack } = require("../game.js");

class MockClassList {
  constructor() {
    this.names = new Set();
  }
  add(...names) { names.forEach((name) => this.names.add(name)); }
  remove(...names) { names.forEach((name) => this.names.delete(name)); }
  contains(name) { return this.names.has(name); }
  toggle(name, force) {
    const shouldAdd = force ?? !this.names.has(name);
    shouldAdd ? this.names.add(name) : this.names.delete(name);
    return shouldAdd;
  }
  set(value) { this.names = new Set(value.split(/\s+/).filter(Boolean)); }
}

class MockElement {
  constructor(id = "") {
    this.id = id;
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.value = id === "hero-class" ? "chienbinh" : "";
    this.hidden = id === "battle-screen" || id === "result-panel" || id === "setup-error";
    this.disabled = false;
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this.classList = new MockClassList();
    this.listeners = new Map();
    this._className = "";
    this._textContent = "";
  }

  get className() { return this._className; }
  set className(value) {
    this._className = value;
    this.classList.set(value);
  }
  get textContent() {
    return this.children.length
      ? this.children.map((child) => child.textContent ?? String(child)).join("")
      : this._textContent;
  }
  set textContent(value) {
    this.children = [];
    this._textContent = String(value);
  }
  get offsetWidth() { return 1; }
  addEventListener(name, listener) {
    if (!this.listeners.has(name)) this.listeners.set(name, []);
    this.listeners.get(name).push(listener);
  }
  dispatchEvent(event) {
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
    return true;
  }
  click() {
    if (!this.disabled) this.dispatchEvent({ type: "click" });
  }
  focus() { this.focused = true; }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) {
    this.children = [...children];
    this._textContent = "";
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
}

function createGameHarness() {
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new MockElement(id));
      return elements.get(id);
    },
    createElement: () => new MockElement(),
    createTextNode: (text) => ({ textContent: String(text) }),
  };
  document.getElementById("student-name").textContent = "Nguyễn Huy Hoàng";
  document.getElementById("student-id").textContent = "31241026670";

  let nextTimerId = 0;
  const timers = new Map();
  const view = {
    document,
    Math,
    setTimeout(callback, delay) {
      const id = ++nextTimerId;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  };

  return {
    document,
    timers,
    game: require("../game.js").mount(document, view),
    element: (id) => document.getElementById(id),
    runOneTimer(delay) {
      const timer = [...timers.entries()].find(([, value]) => value.delay === delay);
      if (!timer) return false;
      const [id, task] = timer;
      timers.delete(id);
      task.callback();
      return true;
    },
  };
}

function randomSequence(...values) {
  const rolls = [...values];
  const next = () => {
    assert.ok(rolls.length > 0, "an unexpected extra random roll occurred");
    return rolls.shift();
  };
  next.remaining = () => rolls.length;
  return next;
}

test("each hero class keeps its agreed stats and maximum health", () => {
  assert.deepEqual(createHero("chienbinh", "Captain America"), {
    name: "Captain America",
    str: 78,
    agi: 111,
    int: 48,
    maxHp: 105,
    hp: 105,
  });
  assert.deepEqual(
    Object.fromEntries(Object.entries(CLASS_PROFILES).map(([id, profile]) => [id, [profile.str, profile.agi, profile.int]])),
    {
      chienbinh: [78, 111, 48],
      satthu: [48, 131, 58],
      thosan: [48, 121, 68],
    },
  );
});

test("a successful normal attack deals strength damage and rounds fractional damage", () => {
  const outcome = resolveAttack(
    { str: 51.6, int: 0 },
    { hp: 100, agi: 15 },
    randomSequence(0.5, 0.9),
  );
  assert.deepEqual(outcome, { hit: true, critical: false, damage: 52, remainingHp: 48 });
});

test("a critical hit doubles damage exactly once", () => {
  const outcome = resolveAttack(
    { str: 78, int: 48 },
    { hp: 600, agi: 15 },
    randomSequence(0.5, 0.47),
  );
  assert.deepEqual(outcome, { hit: true, critical: true, damage: 156, remainingHp: 444 });
});

test("an attack can miss and does not roll for a critical hit", () => {
  let rolls = 0;
  const outcome = resolveAttack({ str: 78, int: 100 }, { hp: 600, agi: 15 }, () => {
    rolls += 1;
    return 0.15;
  });
  assert.deepEqual(outcome, { hit: false, critical: false, damage: 0, remainingHp: 600 });
  assert.equal(rolls, 1);
});

test("the dragon attack respects the hero's 80-percent agility cap", () => {
  const dragon = { str: 100, int: 0 };
  const cappedHero = { hp: 105, agi: Math.min(111, 80) };
  const exactlyAtCap = resolveAttack(dragon, cappedHero, randomSequence(0.8, 0.9));
  const justOverCap = resolveAttack(dragon, cappedHero, randomSequence(0.8001, 0.9));

  assert.equal(exactlyAtCap.hit, false);
  assert.equal(justOverCap.hit, true);
  assert.equal(justOverCap.damage, 100);
  assert.equal(justOverCap.remainingHp, 5);
});

test("attacks clamp damage to the target's remaining HP", () => {
  const outcome = resolveAttack(
    { str: 100, int: 0 },
    { hp: 3, agi: 0 },
    randomSequence(0.01, 0.9),
  );
  assert.deepEqual(outcome, { hit: true, critical: false, damage: 3, remainingHp: 0 });
});

test("invalid hero classes produce a useful error", () => {
  assert.throws(() => createHero("villain", "Captain America"), RangeError);
});

test("the real round controller rejects a second attack until the dragon turn finishes", () => {
  const app = createGameHarness();
  const form = app.element("setup-form");
  form.dispatchEvent({ type: "submit", preventDefault() {} });

  assert.equal(app.element("student-name").textContent, "Nguyễn Huy Hoàng");
  assert.equal(app.element("student-id").textContent, "31241026670");
  assert.equal(app.element("battle-screen").hidden, false);
  assert.equal(app.element("display-hero-name").textContent, "Captain America · Nguyễn Huy Hoàng");

  const originalRandom = Math.random;
  const rolls = randomSequence(0.5, 0.9, 0.1, 0.5, 0.9, 0.1);
  Math.random = rolls;
  try {
    app.game.playRound();
    app.game.playRound();
    assert.equal(app.element("attack-button").disabled, true);
    assert.equal(app.runOneTimer(300), true);
    assert.equal(app.element("attack-button").disabled, false);
    assert.equal(app.element("turn-count").textContent, "01");
    assert.equal(app.element("hero-hp-label").textContent, "105 / 105");
    assert.equal(app.element("dragon-hp-label").textContent, "522 / 600");
    assert.equal(rolls.remaining(), 3);
  } finally {
    Math.random = originalRandom;
  }
});

test("the dragon turn applies the 80-percent hero dodge cap", () => {
  const app = createGameHarness();
  app.element("hero-class").value = "satthu";
  app.element("setup-form").dispatchEvent({ type: "submit", preventDefault() {} });

  const originalRandom = Math.random;
  Math.random = randomSequence(0.5, 0.9, 0.85, 0.9);
  try {
    app.game.playRound();
    assert.equal(app.runOneTimer(300), true);
    assert.equal(app.element("hero-hp-label").textContent, "5 / 105");
  } finally {
    Math.random = originalRandom;
  }
});

test("a new hit replaces the previous cleanup timer for its animation", () => {
  const app = createGameHarness();
  app.element("setup-form").dispatchEvent({ type: "submit", preventDefault() {} });

  const originalRandom = Math.random;
  Math.random = randomSequence(0.5, 0.9, 0.5, 0.5, 0.9);
  try {
    app.game.playRound();
    const firstAnimationTimer = [...app.timers.entries()]
      .find(([, timer]) => timer.delay === 360)?.[0];
    assert.notEqual(firstAnimationTimer, undefined);

    assert.equal(app.runOneTimer(300), true);
    app.game.playRound();

    const animationTimers = [...app.timers.entries()]
      .filter(([, timer]) => timer.delay === 360)
      .map(([id]) => id);
    assert.equal(animationTimers.length, 1);
    assert.notEqual(animationTimers[0], firstAnimationTimer);
  } finally {
    Math.random = originalRandom;
  }
});

test("starting a fresh battle cancels the previous dragon turn", () => {
  const app = createGameHarness();
  app.element("setup-form").dispatchEvent({ type: "submit", preventDefault() {} });

  const originalRandom = Math.random;
  Math.random = randomSequence(0.5, 0.9, 0.1, 0.5, 0.9, 0.1);
  try {
    app.game.playRound();
    assert.equal(app.runOneTimer(300), true);

    app.game.playRound();
    app.game.returnToSetup();
    app.element("setup-form").dispatchEvent({ type: "submit", preventDefault() {} });
    assert.equal(app.runOneTimer(300), false);
    assert.equal(app.element("hero-hp-label").textContent, "105 / 105");
    assert.equal(app.element("dragon-hp-label").textContent, "600 / 600");
    assert.equal(app.element("turn-count").textContent, "01");
    assert.equal(app.element("result-panel").hidden, true);
  } finally {
    Math.random = originalRandom;
  }
});

test("a queued dragon callback cannot change a fresh battle", () => {
  const app = createGameHarness();
  const originalRandom = Math.random;
  Math.random = () => 0.9;
  try {
    app.element("setup-form").dispatchEvent({ type: "submit", preventDefault() {} });
    app.game.playRound();

    const oldTurn = [...app.timers.values()].find((timer) => timer.delay === 300);
    assert.notEqual(oldTurn, undefined);

    app.game.returnToSetup();
    app.element("setup-form").dispatchEvent({ type: "submit", preventDefault() {} });
    oldTurn.callback();

    assert.equal(app.element("hero-hp-label").textContent, "105 / 105");
    assert.equal(app.element("dragon-hp-label").textContent, "600 / 600");
    assert.equal(app.element("turn-count").textContent, "01");
    assert.equal(app.element("round-status").textContent, " SẴN SÀNG");
  } finally {
    Math.random = originalRandom;
  }
});
