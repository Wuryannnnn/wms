<template>
  <div class="login">
    <!-- 浮动粒子 -->
    <div class="particles">
      <span v-for="i in 20" :key="i" class="particle"></span>
    </div>
    <!-- 浮动咖啡豆 -->
    <div class="coffee-beans">
      <span v-for="i in 8" :key="'bean-'+i" class="bean">☕</span>
    </div>

    <div class="login-card animate-card">
      <!-- Logo -->
      <div class="logo-wrapper">
        <img src="@/assets/logo/logo.jpg" alt="logo" class="logo-img" />
      </div>
      <h3 class="title">The Infinite Cafe</h3>
      <p class="subtitle">Dining & Coffee · 仓储管理系统</p>

      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username" class="animate-item" style="--delay: 0.1s">
          <el-input
            v-model="loginForm.username"
            type="text"
            size="large"
            auto-complete="off"
            placeholder="账号"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" class="animate-item" style="--delay: 0.2s">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaEnabled" class="animate-item" style="--delay: 0.3s">
          <el-input
            v-model="loginForm.code"
            size="large"
            auto-complete="off"
            placeholder="验证码"
            style="width: 63%"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" class="login-code-img"/>
          </div>
        </el-form-item>
        <el-checkbox v-model="loginForm.rememberMe" class="remember-me animate-item" style="--delay: 0.4s">记住密码</el-checkbox>
        <el-form-item class="animate-item" style="width:100%; --delay: 0.5s">
          <el-button
            :loading="loading"
            size="large"
            class="login-btn"
            @click.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div style="float: right; margin-top: 10px;" v-if="register">
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <span>© 2026 The Infinite Cafe · All Rights Reserved</span>
    </div>
  </div>
</template>

<script setup>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: ""
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(true);
const redirect = ref(undefined);

function handleLogin() {
  proxy.$refs.loginRef.validate(valid => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        Cookies.set("password", encrypt(loginForm.value.password), { expires: 30 });
        Cookies.set("rememberMe", loginForm.value.rememberMe, { expires: 30 });
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore.login(loginForm.value).then(() => {
        router.push({ path: redirect.value || "/" });
      }).catch(() => {
        loading.value = false;
        // 重新获取验证码
        if (captchaEnabled.value) {
          getCode();
        }
      });
    }
  });
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.data.captchaEnabled === undefined ? true : res.data.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.data.img;
      loginForm.value.uuid = res.data.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  };
}

getCode();
getCookie();
</script>

<style lang='scss' scoped>
/* ========== 动态渐变背景 ========== */
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #1a1a2e);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ========== 浮动光点粒子 ========== */
.particles {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
}
.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: floatUp linear infinite;
}
@for $i from 1 through 20 {
  .particle:nth-child(#{$i}) {
    left: random(100) * 1%;
    width: (2 + random(6)) * 1px;
    height: (2 + random(6)) * 1px;
    animation-duration: (8 + random(15)) * 1s;
    animation-delay: random(10) * -1s;
    opacity: (20 + random(40)) / 100;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-10vh) scale(1);
    opacity: 0;
  }
}

/* ========== 浮动咖啡 emoji ========== */
.coffee-beans {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 0;
}
.bean {
  position: absolute;
  font-size: 20px;
  animation: floatBean linear infinite;
  opacity: 0.15;
}
@for $i from 1 through 8 {
  .bean:nth-child(#{$i}) {
    left: (5 + random(90)) * 1%;
    font-size: (16 + random(20)) * 1px;
    animation-duration: (15 + random(20)) * 1s;
    animation-delay: random(15) * -1s;
  }
}

@keyframes floatBean {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 0.15; }
  90% { opacity: 0.15; }
  100% {
    transform: translateY(-10vh) rotate(360deg);
    opacity: 0;
  }
}

/* ========== 毛玻璃登录卡片 ========== */
.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 40px 36px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* ========== 卡片入场动画 ========== */
.animate-card {
  animation: cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes cardIn {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ========== Logo ========== */
.logo-wrapper {
  text-align: center;
  margin-bottom: 16px;
}
.logo-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  &:hover {
    transform: scale(1.08) rotate(5deg);
    box-shadow: 0 6px 25px rgba(139, 92, 246, 0.4);
  }
}

/* ========== 标题 ========== */
.title {
  margin: 0 auto 6px auto;
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #c084fc, #818cf8, #22d3ee);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s ease-in-out infinite;
}
@keyframes shimmer {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  margin: 0 0 28px 0;
  letter-spacing: 1px;
}

/* ========== 表单项入场动画 ========== */
.animate-item {
  animation: itemSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay, 0s);
  opacity: 0;
}
@keyframes itemSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ========== 表单样式 ========== */
.login-form {
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    box-shadow: none;
    transition: all 0.3s ease;
    &:hover {
      border-color: rgba(139, 92, 246, 0.4);
      background: rgba(255, 255, 255, 0.1);
    }
    &.is-focus {
      border-color: rgba(139, 92, 246, 0.6);
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
    }
  }
  :deep(.el-input__inner) {
    color: #fff;
    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  :deep(.el-input__prefix) {
    color: rgba(255, 255, 255, 0.5);
  }
  .el-input {
    height: 44px;
    input {
      height: 44px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

/* ========== 记住密码 ========== */
.remember-me {
  margin: 0 0 20px 0;
  :deep(.el-checkbox__label) {
    color: rgba(255, 255, 255, 0.6);
  }
  :deep(.el-checkbox__inner) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    border-color: transparent;
  }
}

/* ========== 登录按钮 ========== */
.login-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  color: #fff;
  background: linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6);
  background-size: 200% 200%;
  animation: btnGradient 4s ease infinite;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
  }
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
  }
}

@keyframes btnGradient {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* ========== 链接 ========== */
.link-type {
  color: rgba(196, 181, 253, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
  &:hover {
    color: #c084fc;
  }
}

/* ========== 验证码 ========== */
.login-code {
  width: 33%;
  height: 44px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
    border-radius: 8px;
  }
}
.login-code-img {
  height: 44px;
  padding-left: 12px;
}

/* ========== 底部 ========== */
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-family: Arial, sans-serif;
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 1;
}
</style>
