# Chiến trường — Captain America đấu Rồng Già

Game nhập vai JavaScript đánh theo lượt. Người chơi điều khiển Captain America đối đầu với Rồng Già, chọn một trong ba lớp anh hùng, dùng khiên để né và ra đòn chí mạng.

## Thông tin sinh viên

- **Họ tên:** Nguyễn Huy Hoàng
- **MSSV:** 31241026670

## Cách chơi

1. Mở `index.html` bằng trình duyệt hiện đại. Không cần cài đặt hoặc kết nối mạng.
2. Chọn Chiến binh, Sát thủ hoặc Thợ săn rồi nhấn **Vào trận**.
3. Mỗi lượt, Captain America tấn công trước. Nếu Rồng Già còn sống, rồng sẽ phản công.
4. Đưa HP đối thủ về 0 để chiến thắng. Chọn **Đánh trận mới** để chơi lại cùng lớp hoặc **Đổi lớp anh hùng** để chọn lớp khác.

Rồng có STR 100, AGI 15 và INT 80; các đòn chí mạng gây sát thương gấp đôi. Khả năng né của anh hùng được giới hạn ở 80% để trận đấu luôn có thể kết thúc. Nhật ký hiển thị từng đòn đánh, lần né và kết quả.

| Lớp anh hùng | HP | STR | AGI | INT |
| --- | ---: | ---: | ---: | ---: |
| Chiến binh | 105 | 78 | 111 | 48 |
| Sát thủ | 105 | 48 | 131 | 58 |
| Thợ săn | 105 | 48 | 121 | 68 |

## Cấu trúc

- `index.html`: màn hình chuẩn bị, chiến đấu và kết quả; họ tên và MSSV được ghi cố định trong trang.
- `styles.css`: giao diện, bố cục điện thoại và hiệu ứng chuyển động.
- `game.js`: chỉ số nhân vật, luật giao chiến, nhật ký và quản lý lượt.
- `assets/anhhung.webp`: hình Captain America do sinh viên cung cấp.
- `tests/game.test.js`: kiểm thử các phép tính chiến đấu bằng Node.js tích hợp sẵn.
- `docs/bai-nop-buoi4.docx`: báo cáo minh chứng bài nộp.

## Chạy kiểm thử

Cài Node.js phiên bản 18 trở lên, mở terminal tại thư mục này và chạy:

```bash
node --test tests/game.test.js
```

Game hoạt động ngoại tuyến; ảnh anh hùng và minh họa rồng đều được lưu cùng dự án. Cảm hứng giao diện và cách đánh theo lượt dựa trên bài tập mẫu Buổi 4; phần mã game được tổ chức lại để dùng trực tiếp trên trang.
