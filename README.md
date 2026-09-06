# Landing Page — Trading Psychology Core Set + Guided Set

หน้าเว็บนี้เป็น static site ใช้ไฟล์งานทั้งหมดจากโฟลเดอร์เดียวกัน และโหลด Google Analytics 4 กับ Meta Pixel สำหรับวัดผล

## ก่อนเผยแพร่

1. เปิด `app.js`
2. หน้าสมัครอยู่ที่ `signup.html` และเชื่อม Google Form `https://forms.gle/ihzm1ck9Z9KhVomq6` แล้ว
3. ปุ่ม Core และ Guided ใน Landing Page จะส่งแพ็กเกจที่เลือกไปยังหน้าสมัครอัตโนมัติ
3. เปิด `index.html` เพื่อตรวจปุ่มสมัคร ตัวอย่างภาพ และไฟล์ PDF
4. อัปโหลดเนื้อหาทั้งหมดในโฟลเดอร์ `mini-landing-page` ไปที่ root ของ GitHub Pages โดยรักษาโครงสร้างไฟล์เดิม โฟลเดอร์ `self-check/` จะเปิดที่ `https://trading.thanaphatacademy.com/self-check/`
5. หลังทราบ URL จริง ให้เปลี่ยน `og:image` ใน `index.html` เป็น URL เต็มของ `assets/og-share.png` เพื่อให้ภาพพรีวิวใน LINE และ Social Media แสดงได้เสถียร

## สิ่งที่ตั้งค่าไว้แล้ว

- ราคาเปิดตัวสิ้นสุดวันที่ 13 กันยายน 2569 เวลา 23:59 น. ตามเวลาไทย
- Core Set ราคาเปิดตัว 790 บาท / ราคาปกติ 990 บาท
- Guided Set ราคาเปิดตัว 1,490 บาท / ราคาปกติ 1,690 บาท
- Core Set ส่งภายใน 1 วันหลัง Admin ตรวจสอบการชำระเงิน
- Meta Pixel/Dataset ID `936259682502763`: Landing Page ส่ง `PageView` และ `ViewContent`; หน้าสมัครส่ง `PageView` และ `InitiateCheckout`
- การเปิด Google Form ส่ง Custom Event `OpenRegistrationForm` เมื่อเลือกแพ็กเกจแล้ว และไม่นับเป็น `Purchase`
- หน้าเว็บไม่มี Browser `Purchase`; ระบบส่ง `Purchase` ผ่าน Apps Script หลัง Admin ยืนยันเงินจริงเท่านั้น
- GA4 Measurement ID `G-1ZEJBM398K`: ทุกหน้าส่ง `page_view` อัตโนมัติ
- Landing Page ส่ง `signup_click`; หน้าสมัครส่ง `package_select`, `open_registration_form` และ `open_line_oa` โดยมีเฉพาะชื่อแพ็กเกจ ไม่มีชื่อ Email หรือข้อมูลการชำระเงิน
- `self-check/` เป็นสำเนา deploy จาก `marketing/trading-psychology-self-check/` มีเฉพาะ runtime files และ assets ที่ต้องใช้จริง หากแก้ต้นทางต้องซิงก์สำเนานี้ก่อนอัปโหลด
- MyGPT, Audio Book และสิทธิ์เข้ากลุ่มของ Guided Set ส่งภายใน 30 กันยายน 2569
- โปรแกรม 30 วันเริ่มเผยแพร่คลิปวันที่ 1–30 ตุลาคม 2569
- รูป Dashboard ระบุว่าเป็นข้อมูลจำลอง

## จุดที่ควรยืนยันก่อนส่งลิงก์จริง

- URL ของแบบฟอร์มสั่งซื้อ
- ตัวเลือกแพ็กเกจใน Google Form ต้องตรงกับราคาเปิดตัว 790 / 1,490 บาท
- URL ของหน้าเว็บหลังอัปโหลดขึ้น Hosting
