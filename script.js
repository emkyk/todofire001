// Firebaseの設定を初期化
const firebaseConfig = {
    apiKey: 
    authDomain: 
    projectId: 
    storageBucket: 
    messagingSenderId: 
    appId: 
    databaseURL: 
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ページが読み込まれたときに既存のTO DOをロード
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
});

// 新しいTO DOを追加
function addTodo() {
    const todoInput = document.getElementById('todoInput');
    const colorPicker = document.getElementById('colorPicker');
    const todoText = todoInput.value; // TO DO のテキストを取得
    const todoColor = colorPicker.value; // 選択した色を取得
    if (todoText === '') return; // テキストが空の場合は何もしない

    const todo = {
        text: todoText,
        color: todoColor,
        completed: false
    };

    saveTodoToFirebase(todo); // Firebaseに保存
    todoInput.value = ''; // 入力フィールドをクリア
}

// TO DO をFirebaseに保存
function saveTodoToFirebase(todo) {
    const newTodoRef = database.ref('todos').push();
    newTodoRef.set(todo);
}

// FirebaseからTO DOを取得
function getTodosFromFirebase(callback) {
    database.ref('todos').once('value', (snapshot) => {
        const todos = [];
        snapshot.forEach(childSnapshot => {
            const todo = childSnapshot.val();
            todo.key = childSnapshot.key; // Firebaseのキーを保持
            todos.push(todo);
        });
        callback(todos);
    });
}

// TO DO をDOMに追加
function appendTodoToDOM(todo) {
    const todoContainer = document.getElementById('todoContainer'); // TO DO コンテナを取得

    const todoCard = document.createElement('div'); // TO DO カードを作成
    todoCard.className = 'todoCard';
    todoCard.style.backgroundColor = todo.color; // カードの背景色を設定
    todoCard.dataset.todoKey = todo.key; // Firebaseのキーをデータ属性として保持

    const todoText = document.createElement('p'); // TO DO テキストを作成
    todoText.textContent = todo.text;
    if (todo.completed) {
        todoCard.classList.add('completed'); // 完了したTO DO のスタイルを適用
    }

    // ボタン用コンテナを作成
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'todoButtons';

    // 完了ボタンを作成
    const completeBtn = document.createElement('button');
    completeBtn.className = 'completeBtn';
    completeBtn.textContent = 'comp';
    completeBtn.onclick = () => toggleComplete(todoCard, todo.key);

    // 削除ボタンを作成
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'deleteBtn';
    deleteBtn.textContent = 'del';
    deleteBtn.onclick = () => deleteTodo(todoCard, todo.key);

    buttonContainer.appendChild(completeBtn); // ボタン用コンテナに完了ボタンを追加
    buttonContainer.appendChild(deleteBtn); // ボタン用コンテナに削除ボタンを追加

    todoCard.appendChild(todoText); // カードにテキストを追加
    todoCard.appendChild(buttonContainer); // カードにボタン用コンテナを追加
    todoContainer.appendChild(todoCard); // カードをコンテナに追加
}

// TO DOの完了状態をトグル
function toggleComplete(todoCard, todoKey) {
    database.ref('todos/' + todoKey).once('value', (snapshot) => {
        const todo = snapshot.val();
        const completed = !todo.completed;
        database.ref('todos/' + todoKey).update({ completed });
        todoCard.classList.toggle('completed', completed);
    });
}

// TO DOを削除
function deleteTodo(todoCard, todoKey) {
    database.ref('todos/' + todoKey).remove();
    todoCard.remove();
}

// ページロード時にFirebaseからTO DOを読み込み、DOMに表示
function loadTodos() {
    getTodosFromFirebase(todos => {
        todos.forEach(todo => appendTodoToDOM(todo)); // 各TO DO をDOMに追加
    });
}

// ボタンイベントを追加
document.getElementById('todoContainer').addEventListener('click', (e) => {
    if (e.target.classList.contains('completeBtn')) {
        const todoCard = e.target.closest('.todoCard');
        const todoKey = todoCard.dataset.todoKey;
        toggleComplete(todoCard, todoKey);
    } else if (e.target.classList.contains('deleteBtn')) {
        const todoCard = e.target.closest('.todoCard');
        const todoKey = todoCard.dataset.todoKey;
        deleteTodo(todoCard, todoKey);
    }
});

