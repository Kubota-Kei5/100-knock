# 問題006: React Componentの基本テスト（フロントエンド重要度★★★★★）

## 問題内容

React Testing Libraryを使用して、Reactコンポーネントの基本的なテストを作成してください。

この問題では**React Component Testing**の基本パターンと、ユーザー視点でのテスト手法を学習します。

### 🎯 学習目標

#### 📚 React Testing Libraryの基本
- **render**: コンポーネントのレンダリング
- **screen**: DOM要素の取得
- **queries**: 要素を見つける様々な方法
- **matcher**: react-testing-libraryの専用マッチャー
- **user-centric testing**: ユーザー視点でのテスト

### 🚀 実装タスク

#### タスク1: 基本的なコンポーネントのテスト
以下のコンポーネントをテストしてください：

```typescript
// Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  loading = false,
  type = 'button',
}) => {
  const className = `btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''}`;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
```

```typescript
// UserCard.tsx
import React from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  isOnline: boolean;
  lastSeen?: Date;
}

interface UserCardProps {
  user: User;
  showEmail?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  showEmail = true,
  onEdit,
  onDelete,
}) => {
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div className="user-card" data-testid={`user-card-${user.id}`}>
      <div className="user-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt={`${user.name}'s avatar`} />
        ) : (
          <div className="avatar-placeholder" aria-label={`${user.name}'s avatar`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={`status-indicator ${user.isOnline ? 'online' : 'offline'}`}>
          <span className="sr-only">
            {user.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="user-info">
        <h3 className="user-name">{user.name}</h3>
        <p className="user-role" data-testid="user-role">
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </p>
        
        {showEmail && (
          <p className="user-email" data-testid="user-email">
            {user.email}
          </p>
        )}

        {!user.isOnline && user.lastSeen && (
          <p className="last-seen" data-testid="last-seen">
            Last seen: {formatLastSeen(user.lastSeen)}
          </p>
        )}
      </div>

      <div className="user-actions">
        {onEdit && (
          <button
            onClick={() => onEdit(user)}
            className="btn btn-secondary btn-small"
            aria-label={`Edit ${user.name}`}
          >
            Edit
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(user.id)}
            className="btn btn-danger btn-small"
            aria-label={`Delete ${user.name}`}
            data-testid={`delete-user-${user.id}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
```

#### タスク2: より複雑なコンポーネントのテスト
以下のコンポーネントもテストしてください：

```typescript
// SearchInput.tsx
import React, { useState, useEffect, useCallback } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  initialValue?: string;
  disabled?: boolean;
  showClearButton?: boolean;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  initialValue = '',
  disabled = false,
  showClearButton = true,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const timeoutId = setTimeout(() => {
        setIsSearching(false);
        onSearch(searchQuery);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [onSearch, debounceMs]
  );

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
    }
    
    const cleanup = debouncedSearch(query);
    return cleanup;
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="search-input-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="search-input"
          data-testid="search-input"
          aria-label="Search input"
        />
        
        {isSearching && (
          <div className="search-spinner" data-testid="search-spinner">
            <span className="sr-only">Searching...</span>
          </div>
        )}

        {showClearButton && query && (
          <button
            onClick={handleClear}
            className="clear-button"
            disabled={disabled}
            aria-label="Clear search"
            data-testid="clear-button"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
```

```typescript
// TodoList.tsx
import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  onEditTodo: (id: number, newText: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
}) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo(newTodoText.trim());
      setNewTodoText('');
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      onEditTodo(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="todo-list">
      <div className="todo-header">
        <h2>Todo List</h2>
        <div className="todo-stats" data-testid="todo-stats">
          {completedCount} of {totalCount} completed
        </div>
      </div>

      <form onSubmit={handleSubmit} className="add-todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo..."
          className="add-todo-input"
          data-testid="add-todo-input"
        />
        <button
          type="submit"
          disabled={!newTodoText.trim()}
          className="add-todo-button"
          data-testid="add-todo-button"
        >
          Add Todo
        </button>
      </form>

      {todos.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          No todos yet. Add one above!
        </div>
      ) : (
        <ul className="todo-items" data-testid="todo-items">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
              data-testid={`todo-item-${todo.id}`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggleTodo(todo.id)}
                className="todo-checkbox"
                data-testid={`todo-checkbox-${todo.id}`}
              />

              {editingId === todo.id ? (
                <div className="edit-todo">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-todo-input"
                    data-testid={`edit-todo-input-${todo.id}`}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="save-edit-button"
                    data-testid={`save-edit-${todo.id}`}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="cancel-edit-button"
                    data-testid={`cancel-edit-${todo.id}`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="todo-content">
                  <span
                    className="todo-text"
                    data-testid={`todo-text-${todo.id}`}
                  >
                    {todo.text}
                  </span>
                  <div className="todo-actions">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="edit-button"
                      data-testid={`edit-todo-${todo.id}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="delete-button"
                      data-testid={`delete-todo-${todo.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### 📋 テスト要件

React Testing Libraryを使用して以下の観点でテストしてください：

#### 基本コンポーネントのテスト要件
- **レンダリング**: コンポーネントが正しく表示されること
- **プロパティ**: propsが正しく反映されること
- **条件付きレンダリング**: 条件に応じた要素の表示・非表示
- **アクセシビリティ**: ARIA属性やラベルの確認

#### 複雑なコンポーネントのテスト要件
- **状態管理**: 内部stateの変更が正しく動作すること
- **副作用**: useEffectやタイマーが適切に動作すること
- **イベントハンドリング**: ユーザーインタラクションの処理
- **エラーケース**: 不正な入力やエラー状態の処理

### 作業手順

1. `workspace/frontend/src/components/` ディレクトリを作成
2. 上記のコンポーネントを実装
3. `workspace/frontend/src/components/__tests__/` に対応するテストファイルを作成
4. React Testing Libraryを使用してテストを実装

### 実行コマンド

```bash
# フロントエンド環境に移動
cd workspace/frontend

# 依存関係インストール（初回のみ）
npm install

# テスト実行
npm test

# 特定のコンポーネントのテストのみ実行
npm test Button.test.tsx
npm test UserCard.test.tsx
npm test SearchInput.test.tsx
npm test TodoList.test.tsx
```

### 期待する出力

```
 PASS  src/components/__tests__/Button.test.tsx
  Buttonコンポーネント
    基本的なレンダリング
      ✓ 子要素が正しく表示される (25 ms)
      ✓ クリックイベントが発火する (15 ms)
      ✓ disabled状態で動作が無効になる (12 ms)
    バリアント
      ✓ primaryバリアントが適用される (8 ms)
      ✓ secondaryバリアントが適用される (7 ms)
      ✓ dangerバリアントが適用される (8 ms)
    ローディング状態
      ✓ ローディング中は特別な表示になる (10 ms)
      ✓ ローディング中はクリックが無効になる (9 ms)

 PASS  src/components/__tests__/UserCard.test.tsx
  UserCardコンポーネント
    基本表示
      ✓ ユーザー名が表示される (18 ms)
      ✓ ユーザーロールが表示される (12 ms)
      ✓ オンライン状態が表示される (15 ms)
    メール表示制御
      ✓ showEmailがtrueの場合メールが表示される (11 ms)
      ✓ showEmailがfalseの場合メールが表示されない (10 ms)
    アクションボタン
      ✓ 編集ボタンのクリックイベントが発火する (13 ms)
      ✓ 削除ボタンのクリックイベントが発火する (12 ms)

 PASS  src/components/__tests__/SearchInput.test.tsx
  SearchInputコンポーネント
    基本機能
      ✓ 入力値が正しく更新される (20 ms)
      ✓ デバウンス機能が動作する (350 ms)
      ✓ クリアボタンで入力がクリアされる (15 ms)
    キーボード操作
      ✓ Escapeキーで入力がクリアされる (18 ms)
    ローディング状態
      ✓ 検索中にスピナーが表示される (320 ms)

 PASS  src/components/__tests__/TodoList.test.tsx
  TodoListコンポーネント
    基本表示
      ✓ todo一覧が表示される (22 ms)
      ✓ 完了数の統計が表示される (18 ms)
      ✓ 空の状態が表示される (15 ms)
    todo追加
      ✓ 新しいtodoを追加できる (25 ms)
      ✓ 空文字のtodoは追加できない (12 ms)
    todo操作
      ✓ todoの完了状態を切り替えられる (18 ms)
      ✓ todoを編集できる (35 ms)
      ✓ todoを削除できる (20 ms)

Test Suites: 4 passed, 4 total
Tests:       28 passed, 28 total
Snapshots:   0 total
Time:        2.1 s
```

### 💡 実装のヒント

#### 基本的なコンポーネントテスト
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Buttonコンポーネント', () => {
  it('子要素が正しく表示される', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('クリックイベントが発火する', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### 条件付きレンダリングのテスト
```typescript
describe('条件付きレンダリング', () => {
  it('showEmailがfalseの場合メールが表示されない', () => {
    const user = { 
      id: 1, 
      name: 'John', 
      email: 'john@example.com',
      role: 'user' as const,
      isOnline: true
    };
    
    render(<UserCard user={user} showEmail={false} />);
    
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });
});
```

#### 非同期動作のテスト（デバウンス）
```typescript
describe('デバウンス機能', () => {
  it('デバウンス機能が動作する', async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();
    
    render(<SearchInput onSearch={onSearch} debounceMs={300} />);
    
    const input = screen.getByTestId('search-input');
    
    // 連続で入力
    await user.type(input, 'test');
    
    // デバウンス時間前は呼ばれない
    expect(onSearch).not.toHaveBeenCalled();
    
    // デバウンス時間後に呼ばれる
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test');
    }, { timeout: 400 });
  });
});
```

#### 複雑な状態変更のテスト
```typescript
describe('todo編集', () => {
  it('todoを編集できる', async () => {
    const user = userEvent.setup();
    const onEditTodo = jest.fn();
    const todos = [
      { id: 1, text: 'Original text', completed: false, createdAt: new Date() }
    ];
    
    render(
      <TodoList
        todos={todos}
        onEditTodo={onEditTodo}
        onAddTodo={jest.fn()}
        onToggleTodo={jest.fn()}
        onDeleteTodo={jest.fn()}
      />
    );
    
    // 編集ボタンをクリック
    await user.click(screen.getByTestId('edit-todo-1'));
    
    // 編集フィールドが表示される
    const editInput = screen.getByTestId('edit-todo-input-1');
    expect(editInput).toBeInTheDocument();
    
    // テキストを変更
    await user.clear(editInput);
    await user.type(editInput, 'Updated text');
    
    // 保存ボタンをクリック
    await user.click(screen.getByTestId('save-edit-1'));
    
    expect(onEditTodo).toHaveBeenCalledWith(1, 'Updated text');
  });
});
```

### 🎓 学習ポイント

#### ✅ React Testing Libraryの哲学
- **ユーザー視点**: 実装詳細ではなくユーザーの体験をテスト
- **アクセシビリティ重視**: role, aria-labelを活用した要素取得
- **実際のDOM操作**: 実際のブラウザに近い環境でのテスト

#### ✅ 効果的なクエリの選択
- **getByRole**: 最も推奨される方法
- **getByLabelText**: フォーム要素のテスト
- **getByTestId**: 他の方法が使えない場合の最後の手段

#### ✅ 非同期処理のテスト
- **waitFor**: 非同期更新の待機
- **findBy**: 非同期で現れる要素の取得
- **user-event**: 実際のユーザー操作に近いイベント

### ⚠️ 実務での注意点

1. **実装詳細のテストを避ける**
   ```typescript
   // ❌ 実装詳細をテスト
   expect(component.state.count).toBe(1);
   
   // ✅ ユーザーが見る結果をテスト
   expect(screen.getByText('Count: 1')).toBeInTheDocument();
   ```

2. **適切なクエリの選択**
   ```typescript
   // ❌ data-testidに頼りすぎ
   screen.getByTestId('submit-button');
   
   // ✅ semanticな方法を優先
   screen.getByRole('button', { name: 'Submit' });
   ```

3. **非同期処理の適切な待機**
   ```typescript
   // ❌ 適当なタイムアウト
   setTimeout(() => {
     expect(element).toBeInTheDocument();
   }, 100);
   
   // ✅ 適切な非同期待機
   await waitFor(() => {
     expect(element).toBeInTheDocument();
   });
   ```

### 🚨 重要ポイント

**React Component Testing は実務で最も重要なスキルです：**

- **ユーザー体験**: 実際のユーザー操作をシミュレート
- **リグレッション防止**: 機能変更時の既存機能保護
- **ドキュメント**: テストがコンポーネントの使用方法を示す

適切なコンポーネントテストにより、ユーザーにとって信頼性の高いUIを提供できます！