const auth = window.auth;
const { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js");

// 要素の取得
const userMenuBtn = document.getElementById('user-menu-button');
const userDropdown = document.getElementById('user-dropdown');
const authModal = document.getElementById('auth-modal');
const authContent = document.getElementById('auth-form-content');
const windowTitle = document.getElementById('window-title');

// ② プルダウン開閉
userMenuBtn.onclick = (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('hidden');
    console.log("Menu clicked"); // 動作確認用
};

window.onclick = () => {
    if (userDropdown) userDropdown.classList.add('hidden');
};

// ③ ミニウィンドウ表示
function showAuthModal(mode) {
    console.log("Opening modal:", mode);
    userDropdown.classList.add('hidden');
    authModal.classList.remove('hidden');
    renderAuthForm(mode);
}

function renderAuthForm(mode) {
    const isLogin = (mode === 'login');
    windowTitle.textContent = isLogin ? 'サインイン' : 'アカウント作成';
    
    // ④ GoogleボタンのHTML
    authContent.innerHTML = `
        <button class="google-btn" id="g-login-btn">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"> Googleで${isLogin ? 'ログイン' : '登録'}
        </button>
        <div style="margin:15px 0; color:#888; font-size:12px;">またはメールアドレス</div>
        <input type="email" id="f-email" class="auth-input" placeholder="メールアドレス">
        <input type="password" id="f-pass" class="auth-input" placeholder="パスワード">
        <button class="primary-btn" id="f-exec-btn">${isLogin ? '次へ' : '作成'}</button>
        <p id="f-switch-btn" style="color:#1a73e8; font-size:13px; cursor:pointer; margin-top:20px;">
            ${isLogin ? '新規登録はこちら' : 'ログインはこちら'}
        </p>
    `;

    document.getElementById('g-login-btn').onclick = () => {
        signInWithPopup(auth, new GoogleAuthProvider()).then(() => authModal.classList.add('hidden'));
    };

    document.getElementById('f-exec-btn').onclick = () => {
        const e = document.getElementById('f-email').value;
        const p = document.getElementById('f-pass').value;
        const task = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
        task(auth, e, p).then(() => authModal.classList.add('hidden')).catch(err => alert(err.message));
    };

    document.getElementById('f-switch-btn').onclick = () => renderAuthForm(isLogin ? 'signup' : 'login');
}

// ボタンイベント
document.getElementById('btn-signin').onclick = () => showAuthModal('login');
document.getElementById('btn-signup').onclick = () => showAuthModal('signup');
document.getElementById('btn-logout').onclick = () => signOut(auth);
document.getElementById('close-modal').onclick = () => authModal.classList.add('hidden');

// ログイン状態監視
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const guestNav = document.getElementById('header-guest-nav');
    const userBtn = document.getElementById('main-user-btn');
    const emailDisp = document.getElementById('display-email');

    if (user) {
        // ログイン時：テキストボタンを隠し、アイコンを表示
        guestNav.classList.add('hidden');
        userBtn.classList.remove('hidden');
        emailDisp.textContent = user.email;
        if (typeof refreshCloudList === 'function') refreshCloudList(); // グループ分けツール用
    } else {
        // 未ログイン時：アイコンを隠し、テキストボタンを表示
        guestNav.classList.remove('hidden');
        userBtn.classList.add('hidden');
    }
});

// 各種ボタンのイベント紐付け
document.getElementById('trigger-signin-top').onclick = () => openAuthModal('login');
document.getElementById('trigger-signup-top').onclick = () => openAuthModal('signup');
document.getElementById('trigger-logout').onclick = () => signOut(auth);

// アカウント削除の実行処理
document.getElementById('trigger-delete-account').onclick = async () => {
    if (!currentUser) return;
    const confirmDelete = confirm("本当にアカウントを削除しますか？\n保存された名簿データもすべて削除され、復元はできません。");
    
    if (confirmDelete) {
        try {
            // Firestoreのデータを削除（もしあれば）
            // await deleteDoc(doc(db, "users", currentUser.uid)); 
            
            // Firebase Authのアカウントを削除
            await currentUser.delete();
            alert("アカウントを削除しました。");
            location.reload(); 
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                alert("セキュリティ保護のため、再ログインしてから再度削除をお試しください。");
                signOut(auth);
            } else {
                alert("エラーが発生しました: " + error.message);
            }
        }
    }
};