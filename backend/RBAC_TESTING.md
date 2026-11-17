# 🧪 RBAC Testing Guide

Manual testing guide untuk sistem RBAC SIREMUN.

## Setup

```bash
cd backend

# Run migration
php artisan migrate:fresh

# Seed akun testing
php artisan db:seed --class=AkunSeeder

# Start server
php artisan serve
```

## Test Accounts

| Username | Password | Role | Deskripsi |
|----------|----------|------|-----------|
| 1 | 1 | pegawai | User biasa |
| 2 | 2 | bendahara | Approve pembayaran |
| 3 | 3 | kepegawaian | Manage pegawai & verifikasi |
| 4 | 4 | verifikator | Verifikasi dokumen |
| 5 | 5 | pj_unit | Approve level unit |
| 6 | 6 | upt_remunerasi | Full admin |

---

## Test Cases

### 1. Authentication

#### ✅ Test: Login Successful
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"1"}'
```

Expected:
- Status: 200
- Response contains: `token`, `akun`, `abilities`
- Token format: `{id}|{hash}`

#### ✅ Test: Login Failed - Wrong Password
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"wrong"}'
```

Expected:
- Status: 422
- Error message about credentials

#### ✅ Test: Get Current User
```bash
# Ganti YOUR_TOKEN dengan token dari login
curl http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected:
- Status: 200
- Response contains user info + abilities

#### ✅ Test: Logout
```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected:
- Status: 200
- Token becomes invalid

---

### 2. Ability Checks

#### ✅ Test: Check Specific Ability
```bash
# Login as pegawai (1/1)
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"1"}' | jq -r '.token')

# Check if can create pengajuan
curl http://localhost:8000/api/check-ability/pengajuan:create \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- `{"has_ability": true}` (pegawai bisa create)

```bash
# Check if can approve
curl http://localhost:8000/api/check-ability/pengajuan:approve \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- `{"has_ability": false}` (pegawai tidak bisa approve)

---

### 3. Protected Endpoints

#### ✅ Test: Create Pengajuan (Pegawai Only)

**As Pegawai (should succeed):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"1"}' | jq -r '.token')

curl -X POST http://localhost:8000/api/pengajuan \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 200
- Success message

**As Bendahara (should fail):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"2","password":"2"}' | jq -r '.token')

curl -X POST http://localhost:8000/api/pengajuan \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 403
- Error: "Akses ditolak"

#### ✅ Test: Verify Pengajuan (Kepegawaian/Verifikator Only)

**As Kepegawaian (should succeed):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"3","password":"3"}' | jq -r '.token')

curl -X POST http://localhost:8000/api/pengajuan/1/verify \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 200

**As Pegawai (should fail):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"1"}' | jq -r '.token')

curl -X POST http://localhost:8000/api/pengajuan/1/verify \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 403

#### ✅ Test: Approve Pengajuan (Multiple Roles)

**As Bendahara (should succeed):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"2","password":"2"}' | jq -r '.token')

curl -X POST http://localhost:8000/api/pengajuan/1/approve \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 200

**As PJ Unit (should succeed):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"5","password":"5"}' | jq -r '.token')

curl -X POST http://localhost:8000/api/pengajuan/1/approve \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 200

**As Pegawai (should fail):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"1"}' | jq -r '.token')

curl -X POST http://localhost:8000/api/pengajuan/1/approve \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 403

#### ✅ Test: Pengaturan (UPT Remunerasi Only)

**As UPT Remunerasi (should succeed):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"6","password":"6"}' | jq -r '.token')

curl http://localhost:8000/api/pengaturan \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 200

**As Anyone Else (should fail):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"1"}' | jq -r '.token')

curl http://localhost:8000/api/pengaturan \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
- Status: 403

---

### 4. Role-Specific Abilities

#### ✅ Test: Pegawai Abilities
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"1"}' | jq -r '.token')

curl http://localhost:8000/api/me \
  -H "Authorization: Bearer $TOKEN" | jq '.abilities'
```

Expected abilities:
```json
[
  "pengajuan:create",
  "pengajuan:read-own",
  "pengajuan:update-own",
  "dokumen:upload-own",
  "profil:read-own",
  "profil:update-own"
]
```

#### ✅ Test: Kepegawaian Abilities
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"3","password":"3"}' | jq -r '.token')

curl http://localhost:8000/api/me \
  -H "Authorization: Bearer $TOKEN" | jq '.abilities'
```

Expected abilities:
```json
[
  "pengajuan:read-all",
  "pengajuan:verify",
  "pengajuan:reject",
  "pegawai:read-all",
  "pegawai:create",
  "pegawai:update",
  "akun:create",
  "akun:update",
  "dokumen:read-all"
]
```

#### ✅ Test: UPT Remunerasi Abilities (Full Access)
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"6","password":"6"}' | jq -r '.token')

curl http://localhost:8000/api/me \
  -H "Authorization: Bearer $TOKEN" | jq '.abilities'
```

Expected: Should have most abilities including `pengaturan:manage`

---

## Postman Collection

Import this collection to Postman for easier testing:

```json
{
  "info": {
    "name": "SIREMUN RBAC Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Login - Pegawai",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.collectionVariables.set('token', pm.response.json().token);"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\"username\":\"1\",\"password\":\"1\"}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/login"
        }
      }
    },
    {
      "name": "Get Me",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/me"
        }
      }
    }
  ]
}
```

---

## Automated Testing Script

Create `test-rbac.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api"

echo "🧪 Testing RBAC System..."
echo ""

# Test 1: Login as each role
echo "1️⃣ Testing login for all roles..."
for i in {1..6}; do
  RESPONSE=$(curl -s -X POST $BASE_URL/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$i\",\"password\":\"$i\"}")
  
  if echo $RESPONSE | grep -q "token"; then
    echo "✅ Login successful for user $i"
  else
    echo "❌ Login failed for user $i"
  fi
done
echo ""

# Test 2: Check abilities
echo "2️⃣ Testing ability checks..."
TOKEN=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username":"1","password":"1"}' | jq -r '.token')

# Pegawai can create
RESPONSE=$(curl -s -X POST $BASE_URL/pengajuan \
  -H "Authorization: Bearer $TOKEN")
if echo $RESPONSE | grep -q "created"; then
  echo "✅ Pegawai can create pengajuan"
else
  echo "❌ Pegawai cannot create pengajuan"
fi

# Pegawai cannot approve
RESPONSE=$(curl -s -X POST $BASE_URL/pengajuan/1/approve \
  -H "Authorization: Bearer $TOKEN")
if echo $RESPONSE | grep -q "403"; then
  echo "✅ Pegawai correctly blocked from approve"
else
  echo "❌ Pegawai should not be able to approve"
fi

echo ""
echo "✨ Testing complete!"
```

Run with: `chmod +x test-rbac.sh && ./test-rbac.sh`

---

## Frontend Testing Checklist

1. **Login Testing**
   - [ ] Login dengan setiap role (1-6)
   - [ ] Token tersimpan di localStorage
   - [ ] Abilities di-load dengan benar
   - [ ] Redirect ke dashboard setelah login

2. **UI Testing**
   - [ ] Menu items show/hide sesuai permission
   - [ ] Buttons hide jika tidak punya permission
   - [ ] Protected routes redirect ke unauthorized

3. **Component Testing**
   - [ ] `<Can>` component berfungsi
   - [ ] `<ProtectedRoute>` blocking access
   - [ ] `useRBAC()` hook returns correct data

4. **API Call Testing**
   - [ ] 403 errors di-handle dengan baik
   - [ ] Toast notifications muncul
   - [ ] Error messages informatif

5. **Role-Specific Testing**

   **As Pegawai (1/1):**
   - [ ] Bisa buat pengajuan baru
   - [ ] Bisa lihat pengajuan sendiri
   - [ ] TIDAK bisa verify/approve
   - [ ] TIDAK bisa akses pengaturan

   **As Bendahara (2/2):**
   - [ ] Bisa approve pengajuan
   - [ ] Bisa lihat pembayaran
   - [ ] Bisa generate laporan
   - [ ] TIDAK bisa buat pengajuan

   **As UPT Remunerasi (6/6):**
   - [ ] Bisa akses semua menu
   - [ ] Bisa akses pengaturan
   - [ ] Bisa approve final

---

## Common Issues & Solutions

### Issue: "Akses ditolak" meskipun sudah login

**Solution:**
1. Check token di localStorage
2. Verify abilities di response `/api/me`
3. Check console untuk error
4. Re-login untuk refresh token

### Issue: Abilities tidak sync antara backend dan frontend

**Solution:**
1. Update `AuthController::getAbilitiesForRole()`
2. Update `frontend/src/lib/rbac.ts`
3. Restart both servers
4. Clear localStorage dan re-login

### Issue: Protected route tidak redirect

**Solution:**
1. Check `ProtectedRoute` implementation
2. Verify route configuration
3. Check browser console untuk error

---

Selamat testing! 🚀
