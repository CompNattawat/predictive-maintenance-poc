# Predictive Maintenance POC – NestJS + React

โครงการนี้เป็น Proof of Concept (POC) สำหรับ Predictive Maintenance โดยใช้:
- **Backend:** NestJS + JSON file storage
- **Frontend:** React (Vite) แสดง Dashboard
- **Logic หลัก:** Linear Regression จาก 10 จุดล่าสุด เพื่อทำนายเวลาแตะ 100°C

โครงสร้างโปรเจกต์:

```bash
predictive-maintenance-poc/
├── backend/   # NestJS API
└── frontend/  # React Dashboard
```

---

## 1. การเตรียมเครื่อง

ต้องติดตั้ง:
- Node.js (แนะนำ v18+)
- npm หรือ yarn

จากนั้นแตกไฟล์ ZIP แล้วเปิดโฟลเดอร์ `predictive-maintenance-poc/` ใน VS Code หรือ IDE ที่ใช้

---

## 2. การติดตั้ง Backend (NestJS)

```bash
cd backend
npm install
```

รันเซิร์ฟเวอร์ (development):

```bash
npm run start:dev
```

ค่าเริ่มต้น:
- Base URL: `http://localhost:3000`
- Endpoints:
  - `POST /api/sensor-data`
  - `GET /api/prediction`

ไฟล์เก็บข้อมูลอุณหภูมิ:
- `backend/data/sensor-data.json`

---

## 3. การติดตั้ง Frontend (React + Vite)

```bash
cd frontend
npm install
```

รัน dev server:

```bash
npm run dev
```

ค่าเริ่มต้น:
- URL: `http://localhost:5173` (หรือ 5174 ถ้ามีการชนพอร์ต)

Frontend จะเรียก Backend ผ่าน `http://localhost:3000/api/...`  
ถ้าต้องการเปลี่ยน ให้แก้ที่ `frontend/src/services/api.ts`

---

## 4. โครงสร้าง Backend โดยสรุป

```bash
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── sensor/
│   │   ├── sensor.controller.ts
│   │   └── sensor.service.ts
│   ├── prediction/
│   │   ├── prediction.controller.ts
│   │   └── prediction.service.ts
│   └── common/
│       └── file-storage/
│           └── json-storage.service.ts
└── data/
    └── sensor-data.json
```

### 4.1 `POST /api/sensor-data`
- รับ body:
  ```json
  {
    "temperature": 55.2,
    "timestamp": "2025-11-26T10:30:00.000Z"
  }
  ```
- ถ้าไม่ส่ง `timestamp` → backend จะเซ็ตเป็นเวลาปัจจุบัน (ISO string)
- บันทึกลง `data/sensor-data.json` (append ต่อท้าย)

### 4.2 `GET /api/prediction`
- อ่าน 10 จุดล่าสุดจาก `sensor-data.json`
- คำนวณ Linear Regression (y = mx + c)
- ทำนายเวลาแตะ 100°C
- คืนสถานะ:
  - `NOT_ENOUGH_DATA`
  - `NO_OVERHEAT_TREND`
  - `WILL_OVERHEAT`
  - `OVERHEATED`

---

## 5. โครงสร้าง Frontend โดยสรุป

```bash
frontend/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   ├── SensorInputPanel.tsx
    │   ├── TemperatureChart.tsx
    │   └── StatusPanel.tsx
    └── services/
        └── api.ts
```

### 5.1 SensorInputPanel
- ให้ผู้ใช้กรอก temperature หรือสุ่มค่า
- กด Submit เพื่อยิง `POST /api/sensor-data`
- หลังจากส่งสำเร็จ → refresh ข้อมูล prediction

### 5.2 TemperatureChart
- แสดงกราฟ Line จากข้อมูลที่ Backend ส่งกลับมา (10 จุดล่าสุด)

### 5.3 StatusPanel
- แสดงข้อความ:
  - อีกกี่ชั่วโมงจะถึง 100°C
  - เวลาที่คาดว่าจะถึง (DateTime)
  - หรือข้อความ "ยังไม่มีแนวโน้ม Overheat"

---

## 6. การปรับแต่ง

- เปลี่ยน Threshold ได้ที่ `prediction.service.ts` (เช่น จาก 100°C เป็นค่าอื่น)
- เปลี่ยนจำนวนจุดย้อนหลัง (จาก 10 จุด) ใน service logic ได้ตามต้องการ
- สามารถเพิ่ม UI/Theme หรือ library อื่น ๆ บนฝั่ง React ได้ตามสะดวก

---

## 7. ทดสอบแบบเร็ว ๆ

1. รัน Backend:
   ```bash
   cd backend
   npm run start:dev
   ```
2. รัน Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`
4. ลองกรอก/สุ่มค่าอุณหภูมิ 5–10 ครั้ง
5. ดูผลการทำนายบน Status Panel + กราฟ

---

## 8. ใช้คู่กับ AI (Prompt)

สามารถเอา `README.md` นี้และไฟล์ `full_requirements.md` ไปใส่ใน Cursor / ChatGPT  
เพื่อให้ช่วย generate โค้ดเพิ่มเติม, refactor, หรือเพิ่มฟังก์ชันอื่น ๆ ได้ตามต้องการ
