const FRONTEND_URL = process.env.FRONTEND_URL || 'http://10.0.0.4:5051';

export const verifiedPage = (fullName: string) => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verificado — Fundação Hubble</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: #f0f4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #1d4ed8; font-size: 24px; margin-bottom: 12px; }
    p { color: #4b5563; line-height: 1.6; margin-bottom: 8px; }
    .name { font-weight: bold; color: #111827; }
    .btn {
      display: inline-block;
      margin-top: 28px;
      padding: 12px 32px;
      background: #2563eb;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 15px;
    }
    .footer { margin-top: 32px; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>Email Verificado!</h1>
    <p>Olá, <span class="name">${fullName}</span>!</p>
    <p>A tua conta na <strong>Fundação Hubble</strong> foi activada com sucesso.</p>
    <p>Já podes fazer login e começar a fazer doações. 💙</p>
    <a href="${FRONTEND_URL}/auth/login" class="btn">
      Ir para o Login
    </a>
    <div class="footer">Fundação Hubble &mdash; Juntos fazemos a diferença</div>
  </div>
</body>
</html>
`;

export const alreadyVerifiedPage = () => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Já Verificado — Fundação Hubble</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: #f0f4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #1d4ed8; font-size: 24px; margin-bottom: 12px; }
    p { color: #4b5563; line-height: 1.6; }
    .btn {
      display: inline-block;
      margin-top: 28px;
      padding: 12px 32px;
      background: #2563eb;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
    }
    .footer { margin-top: 32px; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">ℹ️</div>
    <h1>Email já verificado</h1>
    <p>Este email já foi verificado anteriormente.</p>
    <p>Podes fazer login normalmente.</p>
    <a href="${FRONTEND_URL}/auth/login" class="btn">
      Ir para o Login
    </a>
    <div class="footer">Fundação Hubble &mdash; Juntos fazemos a diferença</div>
  </div>
</body>
</html>
`;

export const invalidTokenPage = (message: string) => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Link Inválido — Fundação Hubble</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: #fff0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #dc2626; font-size: 24px; margin-bottom: 12px; }
    p { color: #4b5563; line-height: 1.6; }
    .btn {
      display: inline-block;
      margin-top: 28px;
      padding: 12px 32px;
      background: #dc2626;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
    }
    .footer { margin-top: 32px; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <h1>Link Inválido</h1>
    <p>${message}</p>
    <a href="${FRONTEND_URL}/auth/login" class="btn">
      Voltar ao Login
    </a>
    <div class="footer">Fundação Hubble &mdash; Juntos fazemos a diferença</div>
  </div>
</body>
</html>
`;

export const resetPasswordPage = (token: string) => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Redefinir Palavra-passe — Fundação Hubble</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: #f0f4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #1d4ed8; font-size: 24px; margin-bottom: 24px; }
    .form-group { text-align: left; margin-bottom: 16px; }
    label { display: block; font-size: 14px; color: #374151; margin-bottom: 6px; font-weight: bold; }
    .password-wrap { position: relative; }
    input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 15px;
      outline: none;
    }
    .password-wrap input { padding-right: 44px; }
    .toggle-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 18px;
      color: #6b7280;
      padding: 4px;
    }
    input:focus { border-color: #2563eb; }
    .btn {
      width: 100%;
      margin-top: 8px;
      padding: 12px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 15px;
      cursor: pointer;
    }
    .btn:hover { background: #1d4ed8; }
    .msg { margin-top: 16px; font-size: 14px; color: #dc2626; display: none; }
    .footer { margin-top: 32px; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔒</div>
    <h1>Nova Palavra-passe</h1>
    <form method="POST" action="/auth/reset-password" id="reset-form">
      <input type="hidden" name="token" value="${token}" />
      <div class="form-group">
        <label>Nova palavra-passe</label>
        <div class="password-wrap">
          <input type="password" name="password" id="password" placeholder="Mínimo 8 caracteres" />
          <button type="button" class="toggle-btn" data-target="password" aria-label="Mostrar palavra-passe">👁</button>
        </div>
      </div>
      <div class="form-group">
        <label>Confirmar palavra-passe</label>
        <div class="password-wrap">
          <input type="password" id="confirm" placeholder="Repete a palavra-passe" />
          <button type="button" class="toggle-btn" data-target="confirm" aria-label="Mostrar confirmação da palavra-passe">👁</button>
        </div>
      </div>
      <button type="submit" class="btn">Redefinir Palavra-passe</button>
      <div class="msg" id="msg"></div>
    </form>
    <div class="footer">Fundação Hubble &mdash; Juntos fazemos a diferença</div>
  </div>
  <script>
    document.getElementById('reset-form').addEventListener('submit', function (event) {
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm').value;
      const msg = document.getElementById('msg');
      msg.style.display = 'none';

      if (password.length < 8) {
        event.preventDefault();
        msg.textContent = 'A palavra-passe deve ter pelo menos 8 caracteres.';
        msg.style.color = '#dc2626';
        msg.style.display = 'block';
        return;
      }
      if (password !== confirm) {
        event.preventDefault();
        msg.textContent = 'As palavras-passe não coincidem.';
        msg.style.color = '#dc2626';
        msg.style.display = 'block';
      }
    });
    document.querySelectorAll('.toggle-btn').forEach(function (button) {
      button.addEventListener('click', function () {
        const target = document.getElementById(button.dataset.target);
        const isPassword = target.type === 'password';
        target.type = isPassword ? 'text' : 'password';
        button.textContent = isPassword ? '🙈' : '👁';
        button.setAttribute('aria-label', isPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe');
      });
    });
  </script>
</body>
</html>
`;

export const resetSuccessPage = () => `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Palavra-passe Redefinida — Fundação Hubble</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: #f0f4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px 40px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { color: #16a34a; font-size: 24px; margin-bottom: 12px; }
    p { color: #4b5563; line-height: 1.6; }
    .btn {
      display: inline-block;
      margin-top: 28px;
      padding: 12px 32px;
      background: #2563eb;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
    }
    .footer { margin-top: 32px; color: #9ca3af; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🎉</div>
    <h1>Palavra-passe Redefinida!</h1>
    <p>A tua palavra-passe foi alterada com sucesso.</p>
    <p>Já podes fazer login com a nova palavra-passe.</p>
    <a href="${FRONTEND_URL}/auth/login" class="btn">
      Ir para o Login
    </a>
    <div class="footer">Fundação Hubble &mdash; Juntos fazemos a diferença</div>
  </div>
</body>
</html>
`;
