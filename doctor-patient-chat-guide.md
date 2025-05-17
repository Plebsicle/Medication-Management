# 🩺 Real-Time Doctor-Patient Chat System (Socket.IO + Prisma)

This guide helps you implement a real-time chat system between patients and doctors using **Socket.IO**, **Prisma**, and your existing schema.

---

## 🧱 1. Update Prisma Schema

### ➕ Add `doctor_patient_chat` model

```prisma
model doctor_patient_chat {
  chat_id     Int      @id @default(autoincrement())
  doctor_id   Int
  patient_id  Int
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  doctor      user     @relation("doctor_chats", fields: [doctor_id], references: [id], onDelete: Cascade)
  patient     user     @relation("patient_chats", fields: [patient_id], references: [id], onDelete: Cascade)

  chatMessages chat_message[]

  @@unique([doctor_id, patient_id])
  @@index([doctor_id])
  @@index([patient_id])
}
```

### 🔁 Update `chat_message` model

```prisma
model chat_message {
  id              Int      @id @default(autoincrement())
  user_id         Int
  chat_id         Int?
  content         String
  is_ai           Boolean  @default(false)
  created_at      DateTime @default(now())

  user            user     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  chat            doctor_patient_chat? @relation(fields: [chat_id], references: [chat_id], onDelete: Cascade)

  @@index([user_id])
  @@index([chat_id])
}
```

### 🛠 Migrate the changes

```bash
npx prisma migrate dev --name add_doctor_patient_chat
```

---

## 🧑‍🎨 2. Build the Frontend UI

### 📍 Patient Dashboard

- Show list of **available doctors**
- On "Chat" button:
  - If no chat exists → call `/api/chats/initiate`
  - Redirect to `/patient/chat/[chatId]`

### 🩺 Doctor Dashboard

- Show list of **patients** the doctor has chatted with.
- Doctor **cannot** start a new chat — only patients can.
- On selecting a patient, redirect to `/doctor/chat/[chatId]`

---

## 📦 3. Backend API

### `POST /api/chats/initiate`

```ts
// req.body: { doctorId }

const existing = await prisma.doctor_patient_chat.findUnique({
  where: {
    doctor_id_patient_id: {
      doctor_id: req.body.doctorId,
      patient_id: req.user.id, // from session
    },
  },
});

if (existing) {
  return res.json({ chatId: existing.chat_id });
}

const chat = await prisma.doctor_patient_chat.create({
  data: {
    doctor_id: req.body.doctorId,
    patient_id: req.user.id,
  },
});

res.json({ chatId: chat.chat_id });
```

---

## 🌐 4. WebSocket (Socket.IO) Structure

### ✅ Rooms

- Each `chatId` is a separate room: `socket.join(chatId)`
- Patient and Doctor both join same room.

### ✉️ Events

- `message:send`: patient/doctor emits message
- `message:receive`: server broadcasts to room

```ts
io.on("connection", (socket) => {
  socket.on("join", (chatId) => {
    socket.join(chatId);
  });

  socket.on("message:send", async (data) => {
    const { chatId, senderId, content } = data;

    const message = await prisma.chat_message.create({
      data: {
        chat_id: chatId,
        user_id: senderId,
        content,
      },
    });

    io.to(chatId).emit("message:receive", message);
  });
});
```

---

## ✅ Notes

- A doctor can **only chat** with patients who initiated.
- A patient can initiate multiple chats — but only one per doctor.
