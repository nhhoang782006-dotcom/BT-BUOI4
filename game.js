"use strict";

(function (root, factory) {
  const game = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = game;
  }

  if (root.document) {
    game.mount(root.document, root);
  }
})(typeof globalThis === "object" ? globalThis : this, function () {
  const CLASS_PROFILES = Object.freeze({
    chienbinh: Object.freeze({ name: "Chiến binh", str: 78, agi: 111, int: 48 }),
    satthu: Object.freeze({ name: "Sát thủ", str: 48, agi: 131, int: 58 }),
    thosan: Object.freeze({ name: "Thợ săn", str: 48, agi: 121, int: 68 }),
  });

  const DRAGON_PROFILE = Object.freeze({
    name: "Rồng Già",
    maxHp: 600,
    str: 100,
    agi: 15,
    int: 80,
  });

  function createCombatant(profile, maxHp, startingHp = maxHp) {
    return { ...profile, maxHp, hp: startingHp };
  }

  function createHero(classId, name) {
    const profile = CLASS_PROFILES[classId];
    if (!profile) {
      throw new RangeError("Hãy chọn một lớp anh hùng hợp lệ.");
    }
    return createCombatant({ ...profile, name }, 105);
  }

  function resolveAttack(attacker, defender, random = Math.random) {
    if (typeof random !== "function") {
      throw new TypeError("Nguồn ngẫu nhiên phải là một hàm.");
    }

    const hit = random() * 100 > defender.agi;
    if (!hit) {
      return { hit: false, critical: false, damage: 0, remainingHp: defender.hp };
    }

    const critical = random() * 100 < attacker.int;
    const rawDamage = Math.round(attacker.str * (critical ? 2 : 1));
    const damage = Math.min(Math.max(defender.hp, 0), rawDamage);

    return {
      hit: true,
      critical,
      damage,
      remainingHp: Math.max(0, defender.hp - damage),
    };
  }

  function mount(document, view) {
    const element = (id) => document.getElementById(id);
    const setupScreen = element("setup-screen");
    const battleScreen = element("battle-screen");
    const setupForm = element("setup-form");
    const classSelector = element("hero-class");
    const errorMessage = element("setup-error");
    const attackButton = element("attack-button");
    const attackLabel = element("attack-label");
    const combatLog = element("combat-log");
    const resultPanel = element("result-panel");
    const studentName = element("student-name").textContent.trim();
    const studentId = element("student-id").textContent.trim();
    const heroName = `Captain America · ${studentName}`;

    let battle = null;
    let pendingTurn = null;
    const hitAnimationTimers = new WeakMap();

    const messages = Object.freeze({
      chienbinh: "Mạnh trong cận chiến. STR tăng lên 78; AGI và INT phản ánh lối đánh cân bằng của chiến binh.",
      satthu: "Ra đòn linh hoạt, khả năng né và chí mạng cao. Cần chọn thời điểm tấn công thật tốt.",
      thosan: "Đọc trước thế trận với trí tuệ cao. Có xác suất chí mạng nhỉnh hơn các lớp khác.",
    });

    const messageClass = Object.freeze({
      start: "log-start",
      hero: "log-hero-hit",
      dragon: "log-dragon-hit",
      miss: "log-miss",
      critical: "log-crit",
      result: "log-result",
    });

    function setStatus(message, state = "") {
      const status = element("round-status");
      status.className = `round-status${state ? ` is-${state}` : ""}`;
      const dot = document.createElement("span");
      dot.className = "status-dot";
      status.replaceChildren(dot, document.createTextNode(` ${message}`));
    }

    function addLog(message, type) {
      const entry = document.createElement("li");
      entry.className = messageClass[type] || "log-miss";

      const time = document.createElement("span");
      time.className = "log-time";
      time.textContent = String(combatLog.children.length + 1).padStart(2, "0");

      const text = document.createElement("span");
      text.className = "log-text";
      text.textContent = message;

      entry.append(time, text);
      combatLog.appendChild(entry);
      combatLog.scrollTop = combatLog.scrollHeight;
    }

    function setHealth(side, character) {
      const percent = Math.max(0, Math.min(100, (character.hp / character.maxHp) * 100));
      element(`${side}-hp-bar`).style.transform = `scaleX(${percent / 100})`;
      element(`${side}-hp-label`).textContent = `${character.hp} / ${character.maxHp}`;
      element(`${side}-hp-track`).setAttribute("aria-valuenow", String(character.hp));
    }

    function playHitAnimation(side) {
      const card = element(`${side}-card`);
      const className = side === "hero" ? "shake" : "shake-danger";
      const previousTimer = hitAnimationTimers.get(card);
      if (previousTimer !== undefined) view.clearTimeout(previousTimer);

      card.classList.remove(className);
      void card.offsetWidth;
      card.classList.add(className);

      const timer = view.setTimeout(() => {
        card.classList.remove(className);
        hitAnimationTimers.delete(card);
      }, 360);
      hitAnimationTimers.set(card, timer);
    }

    function describeAttack(attacker, defender, result, side) {
      if (!result.hit) {
        const dodger = side === "hero" ? "Rồng Già lượn mình né được đòn đánh." : `${studentName} giơ khiên né được hỏa cầu!`;
        addLog(dodger, "miss");
        return;
      }

      defender.hp = result.remainingHp;
      setHealth(side === "hero" ? "dragon" : "hero", defender);
      playHitAnimation(side === "hero" ? "dragon" : "hero");

      if (result.critical) {
        addLog(`${attacker.name} tung đòn chí mạng! Gây ${result.damage} sát thương.`, "critical");
      } else {
        addLog(`${attacker.name} gây ${result.damage} sát thương.`, side);
      }
    }

    function finishBattle(heroWon) {
      if (!battle || battle.ended) return;

      battle.ended = true;
      battle.phase = "ended";
      if (pendingTurn !== null) {
        view.clearTimeout(pendingTurn);
        pendingTurn = null;
      }

      attackButton.disabled = true;
      attackLabel.textContent = "KẾT THÚC";
      setStatus(heroWon ? "NHIỆM VỤ HOÀN TẤT" : "ANH HÙNG BỊ HẠ", "finished");

      const resultTitle = element("result-title");
      const resultEyebrow = element("result-eyebrow");
      const resultMessage = element("result-message");
      resultPanel.classList.toggle("is-defeat", !heroWon);
      resultTitle.textContent = heroWon ? "THÀNH PHỐ ĐƯỢC BẢO VỆ" : "TRẬN CHIẾN KẾT THÚC";
      resultEyebrow.textContent = heroWon ? "NHIỆM VỤ HOÀN TẤT" : "CẦN TIẾP TỤC HUẤN LUYỆN";
      resultMessage.textContent = heroWon
        ? `Rồng Già đã bị đánh bại. ${studentName} bảo vệ thành phố thành công!`
        : `${studentName} đã kiên cường chiến đấu ${battle.turns} lượt. Hãy thử một lớp anh hùng khác.`;
      element("result-turns").textContent = `KẾT THÚC SAU ${battle.turns} LƯỢT`;
      resultPanel.hidden = false;

      const finalMessage = heroWon
        ? `${studentName} đánh bại Rồng Già và bảo vệ thành phố!`
        : `Rồng Già chiến thắng sau ${battle.turns} lượt giao tranh.`;
      addLog(finalMessage, "result");
      element("result-title").focus({ preventScroll: true });
    }

    function runDragonTurn(activeBattle) {
      if (battle !== activeBattle || activeBattle.ended || activeBattle.phase !== "dragon") return;

      pendingTurn = null;
      const effectiveAgility = Math.min(activeBattle.hero.agi, 80);
      // The agility cap keeps the hero's maximum dodge chance at 80%.
      const actualResult = resolveAttack(activeBattle.dragon, {
        ...activeBattle.hero,
        agi: effectiveAgility,
      }, Math.random);
      describeAttack(activeBattle.dragon, activeBattle.hero, actualResult, "dragon");

      if (activeBattle.hero.hp <= 0) {
        finishBattle(false);
        return;
      }

      activeBattle.phase = "hero";
      attackButton.disabled = false;
      attackLabel.textContent = "TẤN CÔNG";
      setStatus("SẴN SÀNG");
    }

    function playRound() {
      if (!battle || battle.ended || battle.phase !== "hero") return;

      const activeBattle = battle;
      activeBattle.phase = "dragon";
      activeBattle.turns += 1;
      element("turn-count").textContent = String(activeBattle.turns).padStart(2, "0");
      attackButton.disabled = true;
      attackLabel.textContent = "ĐANG ĐÁNH";
      setStatus("ĐANG GIAO TRANH", "busy");

      const heroResult = resolveAttack(activeBattle.hero, activeBattle.dragon);
      describeAttack(activeBattle.hero, activeBattle.dragon, heroResult, "hero");

      if (activeBattle.dragon.hp <= 0) {
        finishBattle(true);
        return;
      }

      pendingTurn = view.setTimeout(() => runDragonTurn(activeBattle), 300);
    }

    function startGame() {
      const selectedClass = classSelector.value;
      if (!CLASS_PROFILES[selectedClass]) {
        errorMessage.textContent = "Vui lòng chọn một lớp anh hùng hợp lệ.";
        errorMessage.hidden = false;
        classSelector.focus();
        return;
      }

      if (pendingTurn !== null) {
        view.clearTimeout(pendingTurn);
        pendingTurn = null;
      }

      const hero = createHero(selectedClass, heroName);
      const dragon = createCombatant(DRAGON_PROFILE, DRAGON_PROFILE.maxHp);
      battle = { hero, dragon, turns: 0, phase: "hero", ended: false };

      element("display-hero-name").textContent = hero.name;
      element("display-hero-class").textContent = CLASS_PROFILES[selectedClass].name.toLocaleUpperCase("vi");
      element("hero-str").textContent = String(hero.str);
      element("hero-agi").textContent = String(hero.agi);
      element("hero-int").textContent = String(hero.int);
      element("turn-count").textContent = "01";
      errorMessage.hidden = true;
      resultPanel.hidden = true;
      resultPanel.classList.remove("is-defeat");
      combatLog.replaceChildren();
      setHealth("hero", hero);
      setHealth("dragon", dragon);
      addLog(`Rồng Già đã xuất hiện. ${studentName} vào vị trí chiến đấu.`, "start");

      attackButton.disabled = false;
      attackLabel.textContent = "TẤN CÔNG";
      setStatus("SẴN SÀNG");
      setupScreen.hidden = true;
      battleScreen.hidden = false;
      element("battle-title").focus({ preventScroll: true });
    }

    function returnToSetup() {
      if (pendingTurn !== null) {
        view.clearTimeout(pendingTurn);
        pendingTurn = null;
      }
      battle = null;
      resultPanel.hidden = true;
      battleScreen.hidden = true;
      setupScreen.hidden = false;
      element("setup-title").focus({ preventScroll: true });
    }

    function updateClassDescription() {
      element("class-description").textContent = messages[classSelector.value] || "Chọn một lớp anh hùng để xem phong cách chiến đấu.";
    }

    element("footer-student").textContent = `${studentName.toLocaleUpperCase("vi")} / ${studentId}`;
    setupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      startGame();
    });
    classSelector.addEventListener("change", updateClassDescription);
    attackButton.addEventListener("click", playRound);
    element("rematch-button").addEventListener("click", startGame);
    element("change-class-button").addEventListener("click", returnToSetup);
    updateClassDescription();

    return { startGame, playRound, returnToSetup };
  }

  return {
    CLASS_PROFILES,
    DRAGON_PROFILE,
    createHero,
    resolveAttack,
    mount,
  };
});
