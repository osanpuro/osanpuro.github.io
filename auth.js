// index.htmlで初期化された auth インスタンス (window.auth) を使用
const auth = window.auth; 

// Firebase v9 の関数を動的にインポートして使用
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js");

// --- DOM要素の取得 ---
const authModal = document.getElementById('auth-modal');
const authFormContent = document.getElementById('auth-form-content');
const showLoginButton = document.getElementById('show-login-button');
const showSignupButton = document.getElementById('show-signup-button');
const logoutButton = document.getElementById('logout-button');
const closeButton = document.getElementById('close-modal-button');
const userStatusHeader = document.getElementById('user-status-header');
const userStatusMain = document.getElementById('user-status-main');


// --- フォーム表示関数 ---

// フォームを閉じる
const closeModal = () => {
    authModal.classList.add('hidden');
};

// フォームを開く
const openModal = (type) => {
    authModal.classList.remove('hidden');
    renderForm(type);
};

// フォーム内容を動的に生成
const renderForm = (type) => {
    const isLogin = type === 'login';
    const title = isLogin ? 'ログイン' : 'サインアップ';
    const emailButtonId = isLogin ? 'btn-signin-email' : 'btn-signup-email';
    const googleButtonId = isLogin ? 'btn-signin-google' : 'btn-signup-google';
    const toggleLinkText = isLogin ? 'アカウントをお持ちではありませんか？ サインアップ' : 'すでにアカウントをお持ちですか？ ログイン';
    const toggleType = isLogin ? 'signup' : 'login';
    const emailInputId = isLogin ? 'input-login-email' : 'input-signup-email';
    const passwordInputId = isLogin ? 'input-login-password' : 'input-signup-password';
    
    authFormContent.innerHTML = `
        <h2>${title}</h2>
        
        <button id="${googleButtonId}" class="form-button google-button">Googleで${title}</button>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">

        <div class="input-group">
            <input type="email" id="${emailInputId}" placeholder="メールアドレス">
        </div>
        <div class="input-group">
            <input type="password" id="${passwordInputId}" placeholder="パスワード${isLogin ? '' : ' (6文字以上)'}">
        </div>
        <button id="${emailButtonId}" class="form-button email-button">${title}</button>
        
        <span class="toggle-link" data-toggle="${toggleType}">${toggleLinkText}</span>
    `;
    
    // イベントリスナーを動的に追加
    setupFormListeners(isLogin, emailInputId, passwordInputId, emailButtonId, googleButtonId);
};


// --- 3. イベントリスナーの設定 ---

// ヘッダーボタン
showLoginButton.addEventListener('click', () => openModal('login'));
showSignupButton.addEventListener('click', () => openModal('signup'));

// ★修正点 1: ✖ボタンのクリックイベントリスナーをここで設定します
closeButton.addEventListener('click', closeModal);

// 切り替えリンク（モーダル内のリンク）
authFormContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('toggle-link')) {
        const type = e.target.getAttribute('data-toggle');
        renderForm(type);
    }
});


// --- 4. 認証処理のロジック ---

function setupFormListeners(isLogin, emailInputId, passwordInputId, emailButtonId, googleButtonId) {
    
    // メール/パスワード認証
    document.getElementById(emailButtonId).addEventListener('click', () => {
        const email = document.getElementById(emailInputId).value;
        const password = document.getElementById(passwordInputId).value;
        
        // パスワードが短い場合のエラーを未然に防ぐチェック
        if (!isLogin && password.length < 6) {
             alert('サインアップエラー: パスワードは6文字以上で設定してください。');
             return;
        }

        if (isLogin) {
            // ログイン処理
            signInWithEmailAndPassword(auth, email, password)
                .catch((error) => {
                    let errorMessage = `ログインエラー: ${error.message}`;
                    if (error.code === 'auth/invalid-credential') {
                        errorMessage += '\n\n【ヒント】入力されたメールアドレスまたはパスワードが間違っています。再確認してください。';
                    }
                    alert(errorMessage);
                });
        } else {
            // サインアップ処理
            createUserWithEmailAndPassword(auth, email, password)
                .catch((error) => {
                    let errorMessage = `サインアップエラー: ${error.message}`;
                    if (error.code === 'auth/weak-password') {
                        errorMessage += '\n\n【ヒント】パスワードが弱すぎます。6文字以上を使用してください。';
                    }
                    alert(errorMessage);
                });
        }
    });

    // Google認証
    document.getElementById(googleButtonId).addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .catch((error) => alert(`Google認証エラー: ${error.message}`));
    });
}


// --- 5. ユーザー状態の監視 ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        // ログイン状態
        closeModal();
        userStatusHeader.textContent = `ようこそ, ${user.displayName || user.email}さん`;
        userStatusMain.textContent = `ようこそ、${user.displayName || user.email}さん！ログイン済みです。`;

        // UIの切り替え
        userStatusHeader.style.display = 'inline';
        showLoginButton.classList.add('hidden');
        showSignupButton.classList.add('hidden');
        logoutButton.classList.remove('hidden');
    } else {
        // ログアウト状態
        userStatusHeader.style.display = 'none';
        userStatusMain.textContent = 'ログインしていません。';
        
        // UIの切り替え
        showLoginButton.classList.remove('hidden');
        showSignupButton.classList.remove('hidden');
        logoutButton.classList.add('hidden');
    }
});

// ログアウト処理
logoutButton.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            alert("ログアウトしました。");
        })
        .catch((error) => {
            alert(`ログアウトエラー: ${error.message}`);
        });
});

// 初期表示ではモーダルは隠しておく
closeModal();