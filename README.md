# Landing Page — Trading Psychology Core Set + Guided Set

หน้าเว็บนี้เป็นไฟล์แบบ standalone ใช้ไฟล์ทั้งหมดจากโฟลเดอร์เดียวกันและไม่มี external dependency

## ก่อนเผยแพร่

1. เปิด `app.js`
2. หน้าสมัครอยู่ที่ `signup.html` และเชื่อม Google Form `https://forms.gle/ihzm1ck9Z9KhVomq6` แล้ว
3. ปุ่ม Core และ Guided ใน Landing Page จะส่งแพ็กเกจที่เลือกไปยังหน้าสมัครอัตโนมัติ
3. เปิด `index.html` เพื่อตรวจปุ่มสมัคร ตัวอย่างภาพ และไฟล์ PDF
4. อัปโหลดทั้งโฟลเดอร์ `mini-landing-page` โดยรักษาโครงสร้างไฟล์เดิม
5. หลังทราบ URL จริง ให้เปลี่ยน `og:image` ใน `index.html` เป็น URL เต็มของ `assets/og-share.png` เพื่อให้ภาพพรีวิวใน LINE และ Social Media แสดงได้เสถียร

## สิ่งที่ตั้งค่าไว้แล้ว

- ราคาเปิดตัวสิ้นสุดวันที่ 13 กันยายน 2569 เวลา 23:59 น. ตามเวลาไทย
- Core Set ราคาเปิดตัว 790 บาท / ราคาปกติ 990 บาท
- Guided Set ราคาเปิดตัว 1,490 บาท / ราคาปกติ 1,690 บาท
- Core Set ส่งภายใน 1 วันหลัง Admin ตรวจสอบการชำระเงิน
- Meta Pixel/Dataset ID `936259682502763`: Landing Page ส่ง `PageView` และ `ViewContent`; หน้าสมัครส่ง `PageView` และ `InitiateCheckout`
- การเปิด Google Form ส่ง Custom Event `OpenRegistrationForm` เมื่อเลือกแพ็กเกจแล้ว และไม่นับเป็น `Purchase`
- หน้าเว็บไม่มี Browser `Purchase`; ระบบส่ง `Purchase` ผ่าน Apps Script หลัง Admin ยืนยันเงินจริงเท่านั้น
- MyGPT, Audio Book และสิทธิ์เข้ากลุ่มของ Guided Set ส่งภายใน 30 กันยายน 2569
- โปรแกรม 30 วันเริ่มเผยแพร่คลิปวันที่ 1–30 ตุลาคม 2569
- รูป Dashboard ระบุว่าเป็นข้อมูลจำลอง

## จุดที่ควรยืนยันก่อนส่งลิงก์จริง

- URL ของแบบฟอร์มสั่งซื้อ
- ตัวเลือกแพ็กเกจใน Google Form ต้องตรงกับราคาเปิดตัว 790 / 1,490 บาท
- URL ของหน้าเว็บหลังอัปโหลดขึ้น Hosting
