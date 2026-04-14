## 설치과정 정리

### 0. node js, docker 등 설치

리눅스 기준

```
# 패키지 업데이트
apt update && apt upgrade -y

# 필수 패키지 설치
apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Node.js 22 설치
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# PM2 설치
npm install -g pm2

# 방화벽 설정
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# 버전 확인
node -v
npm -v
nginx -v
```

```
# Docker 설치
curl -fsSL https://get.docker.com | bash

# Docker Compose 설치
apt install -y docker-compose-plugin

# 확인
docker --version
docker compose version
```

### 1. env, instance.ts 파일 편집

```
cp env.example .env
cp config/instance.example.ts config/instance.ts
```

### 2. 필요한 모듈 설치

```
npm i
```

### 3. deploy

초기 deploy
```
npm run first-deploy
```

업데이트 시
```
npm run deploy
```

### 4. 회원가입후 자기자신을 admin으로 만들기

```
http://localhost:3000/
```

접속 후 회원가입.

```
docker compose -f docker-compose.prod.yml exec postgres psql -U fedi -d fediverse -c "UPDATE users SET role='admin' WHERE handle='your_handle';"
```

`your_handle` 자리에 가입한 핸들 넣고 명령어 실행.