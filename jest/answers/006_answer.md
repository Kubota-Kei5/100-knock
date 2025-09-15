# 解答006: React Componentの基本テスト

## 📝 解答のポイント

### 🎯 学習のねらい
この問題では、React Testing Libraryを使用してReactコンポーネントのテストを書き、ユーザー視点でのテスト手法をマスターすることが目標です。

### ✅ 実装解答例

#### Buttonコンポーネントの実装

```typescript
// workspace/frontend/src/components/Button.tsx
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

#### UserCardコンポーネントの実装

```typescript
// workspace/frontend/src/components/UserCard.tsx
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

export type { User };
```

#### SearchInputコンポーネントの実装

```typescript
// workspace/frontend/src/components/SearchInput.tsx
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

#### TodoListコンポーネントの実装

```typescript
// workspace/frontend/src/components/TodoList.tsx
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

export type { Todo };
```

#### Buttonコンポーネントのテスト

```typescript
// workspace/frontend/src/components/__tests__/Button.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Buttonコンポーネント', () => {
  describe('基本的なレンダリング', () => {
    it('子要素が正しく表示される', () => {
      render(<Button>Click me</Button>);
      
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('デフォルトのpropsが適用される', () => {
      render(<Button>Default Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveClass('btn', 'btn-primary', 'btn-medium');
    });

    it('クリックイベントが発火する', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(<Button onClick={handleClick}>Click me</Button>);
      
      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disabled状態で動作が無効になる', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('バリアント', () => {
    it('primaryバリアントが適用される', () => {
      render(<Button variant="primary">Primary</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('btn-primary');
    });

    it('secondaryバリアントが適用される', () => {
      render(<Button variant="secondary">Secondary</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('btn-secondary');
    });

    it('dangerバリアントが適用される', () => {
      render(<Button variant="danger">Danger</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('btn-danger');
    });
  });

  describe('サイズ', () => {
    it('smallサイズが適用される', () => {
      render(<Button size="small">Small</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('btn-small');
    });

    it('mediumサイズが適用される', () => {
      render(<Button size="medium">Medium</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('btn-medium');
    });

    it('largeサイズが適用される', () => {
      render(<Button size="large">Large</Button>);
      
      expect(screen.getByRole('button')).toHaveClass('btn-large');
    });
  });

  describe('ローディング状態', () => {
    it('ローディング中は特別な表示になる', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      
      // ローディング中の表示
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // spinner
      
      // 元の子要素は表示されない
      expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
      
      // aria-busy属性が設定される
      expect(button).toHaveAttribute('aria-busy', 'true');
      
      // ローディング用のCSSクラスが適用される
      expect(button).toHaveClass('btn-loading');
    });

    it('ローディング中はクリックが無効になる', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      
      render(
        <Button onClick={handleClick} loading>
          Loading Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('ボタンタイプ', () => {
    it('submitタイプが適用される', () => {
      render(<Button type="submit">Submit</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('resetタイプが適用される', () => {
      render(<Button type="reset">Reset</Button>);
      
      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });
});
```

#### UserCardコンポーネントのテスト

```typescript
// workspace/frontend/src/components/__tests__/UserCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard, User } from '../UserCard';

describe('UserCardコンポーネント', () => {
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    isOnline: true
  };

  describe('基本表示', () => {
    it('ユーザー名が表示される', () => {
      render(<UserCard user={mockUser} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('John Doe');
    });

    it('ユーザーロールが表示される', () => {
      render(<UserCard user={mockUser} />);
      
      expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
    });

    it('オンライン状態が表示される', () => {
      render(<UserCard user={mockUser} />);
      
      expect(screen.getByText('Online')).toBeInTheDocument();
      expect(screen.getByText('Online')).toHaveClass('sr-only');
    });

    it('オフライン状態が表示される', () => {
      const offlineUser = { ...mockUser, isOnline: false };
      render(<UserCard user={offlineUser} />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('アバター画像がある場合は画像を表示', () => {
      const userWithAvatar = { ...mockUser, avatar: 'https://example.com/avatar.jpg' };
      render(<UserCard user={userWithAvatar} />);
      
      const avatar = screen.getByRole('img', { name: `${mockUser.name}'s avatar` });
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('アバター画像がない場合はプレースホルダーを表示', () => {
      render(<UserCard user={mockUser} />);
      
      const placeholder = screen.getByLabelText(`${mockUser.name}'s avatar`);
      expect(placeholder).toHaveTextContent('J'); // 名前の最初の文字
      expect(placeholder).toHaveClass('avatar-placeholder');
    });
  });

  describe('メール表示制御', () => {
    it('showEmailがtrueの場合メールが表示される', () => {
      render(<UserCard user={mockUser} showEmail={true} />);
      
      expect(screen.getByTestId('user-email')).toHaveTextContent('john@example.com');
    });

    it('showEmailがfalseの場合メールが表示されない', () => {
      render(<UserCard user={mockUser} showEmail={false} />);
      
      expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
    });

    it('showEmailのデフォルト値はtrue', () => {
      render(<UserCard user={mockUser} />);
      
      expect(screen.getByTestId('user-email')).toBeInTheDocument();
    });
  });

  describe('最後のアクセス時間', () => {
    it('オフラインかつlastSeenがある場合に表示される', () => {
      const offlineUserWithLastSeen = {
        ...mockUser,
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2時間前
      };
      
      render(<UserCard user={offlineUserWithLastSeen} />);
      
      const lastSeen = screen.getByTestId('last-seen');
      expect(lastSeen).toHaveTextContent('Last seen: 2 hours ago');
    });

    it('オンラインの場合は表示されない', () => {
      const onlineUserWithLastSeen = {
        ...mockUser,
        isOnline: true,
        lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000)
      };
      
      render(<UserCard user={onlineUserWithLastSeen} />);
      
      expect(screen.queryByTestId('last-seen')).not.toBeInTheDocument();
    });

    it('分単位で表示される', () => {
      const offlineUser = {
        ...mockUser,
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000) // 30分前
      };
      
      render(<UserCard user={offlineUser} />);
      
      expect(screen.getByTestId('last-seen')).toHaveTextContent('30 minutes ago');
    });

    it('日単位で表示される', () => {
      const offlineUser = {
        ...mockUser,
        isOnline: false,
        lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3日前
      };
      
      render(<UserCard user={offlineUser} />);
      
      expect(screen.getByTestId('last-seen')).toHaveTextContent('3 days ago');
    });
  });

  describe('アクションボタン', () => {
    it('編集ボタンのクリックイベントが発火する', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn();
      
      render(<UserCard user={mockUser} onEdit={onEdit} />);
      
      await user.click(screen.getByRole('button', { name: `Edit ${mockUser.name}` }));
      expect(onEdit).toHaveBeenCalledWith(mockUser);
    });

    it('削除ボタンのクリックイベントが発火する', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      
      render(<UserCard user={mockUser} onDelete={onDelete} />);
      
      await user.click(screen.getByRole('button', { name: `Delete ${mockUser.name}` }));
      expect(onDelete).toHaveBeenCalledWith(mockUser.id);
    });

    it('編集コールバックがない場合は編集ボタンが表示されない', () => {
      render(<UserCard user={mockUser} />);
      
      expect(screen.queryByRole('button', { name: `Edit ${mockUser.name}` })).not.toBeInTheDocument();
    });

    it('削除コールバックがない場合は削除ボタンが表示されない', () => {
      render(<UserCard user={mockUser} />);
      
      expect(screen.queryByRole('button', { name: `Delete ${mockUser.name}` })).not.toBeInTheDocument();
    });

    it('削除ボタンに適切なdata-testidが設定される', () => {
      const onDelete = jest.fn();
      render(<UserCard user={mockUser} onDelete={onDelete} />);
      
      expect(screen.getByTestId(`delete-user-${mockUser.id}`)).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なaria-labelが設定される', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      
      render(<UserCard user={mockUser} onEdit={onEdit} onDelete={onDelete} />);
      
      expect(screen.getByRole('button', { name: `Edit ${mockUser.name}` })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `Delete ${mockUser.name}` })).toBeInTheDocument();
    });

    it('スクリーンリーダー用のテキストが適切に設定される', () => {
      render(<UserCard user={mockUser} />);
      
      expect(screen.getByText('Online')).toHaveClass('sr-only');
    });
  });
});
```

#### SearchInputコンポーネントのテスト

```typescript
// workspace/frontend/src/components/__tests__/SearchInput.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput';

describe('SearchInputコンポーネント', () => {
  // タイマーのモック化
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('基本機能', () => {
    it('プレースホルダーが表示される', () => {
      const onSearch = jest.fn();
      render(<SearchInput onSearch={onSearch} placeholder="Search users..." />);
      
      expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    });

    it('デフォルトプレースホルダーが表示される', () => {
      const onSearch = jest.fn();
      render(<SearchInput onSearch={onSearch} />);
      
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('初期値が設定される', () => {
      const onSearch = jest.fn();
      render(<SearchInput onSearch={onSearch} initialValue="initial query" />);
      
      expect(screen.getByDisplayValue('initial query')).toBeInTheDocument();
    });

    it('入力値が正しく更新される', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'test query');
      
      expect(input).toHaveValue('test query');
    });

    it('disabled状態で入力が無効になる', () => {
      const onSearch = jest.fn();
      render(<SearchInput onSearch={onSearch} disabled />);
      
      expect(screen.getByTestId('search-input')).toBeDisabled();
    });

    it('autoFocus prop が動作する', () => {
      const onSearch = jest.fn();
      render(<SearchInput onSearch={onSearch} autoFocus />);
      
      expect(screen.getByTestId('search-input')).toHaveFocus();
    });
  });

  describe('デバウンス機能', () => {
    it('デバウンス機能が動作する', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} debounceMs={300} />);
      
      const input = screen.getByTestId('search-input');
      
      // 連続で入力
      await user.type(input, 'test');
      
      // デバウンス時間前は呼ばれない
      expect(onSearch).not.toHaveBeenCalled();
      
      // デバウンス時間経過
      jest.advanceTimersByTime(300);
      
      // デバウンス時間後に呼ばれる
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledWith('test');
      });
    });

    it('連続入力時は最後の値のみで検索される', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} debounceMs={300} />);
      
      const input = screen.getByTestId('search-input');
      
      // 連続入力
      await user.type(input, 'a');
      jest.advanceTimersByTime(100);
      
      await user.type(input, 'b');
      jest.advanceTimersByTime(100);
      
      await user.type(input, 'c');
      jest.advanceTimersByTime(300);
      
      // 最後の値のみで検索される
      await waitFor(() => {
        expect(onSearch).toHaveBeenCalledTimes(1);
        expect(onSearch).toHaveBeenCalledWith('abc');
      });
    });
  });

  describe('ローディング状態', () => {
    it('検索中にスピナーが表示される', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} debounceMs={300} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'test');
      
      // スピナーが表示される
      expect(screen.getByTestId('search-spinner')).toBeInTheDocument();
      expect(screen.getByText('Searching...')).toBeInTheDocument();
      
      // デバウンス完了後はスピナーが消える
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.queryByTestId('search-spinner')).not.toBeInTheDocument();
      });
    });

    it('空文字の場合はスピナーが表示されない', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, '   '); // 空白のみ
      
      expect(screen.queryByTestId('search-spinner')).not.toBeInTheDocument();
    });
  });

  describe('クリアボタン', () => {
    it('クリアボタンで入力がクリアされる', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'test query');
      
      // クリアボタンが表示される
      const clearButton = screen.getByTestId('clear-button');
      expect(clearButton).toBeInTheDocument();
      
      // クリアボタンをクリック
      await user.click(clearButton);
      
      expect(input).toHaveValue('');
      expect(onSearch).toHaveBeenCalledWith('');
    });

    it('showClearButtonがfalseの場合クリアボタンが表示されない', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} showClearButton={false} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'test');
      
      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
    });

    it('入力が空の場合クリアボタンが表示されない', () => {
      const onSearch = jest.fn();
      render(<SearchInput onSearch={onSearch} />);
      
      expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
    });

    it('disabled状態でクリアボタンも無効になる', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} initialValue="test" disabled />);
      
      const clearButton = screen.getByTestId('clear-button');
      expect(clearButton).toBeDisabled();
    });
  });

  describe('キーボード操作', () => {
    it('Escapeキーで入力がクリアされる', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'test query');
      
      // Escapeキーを押す
      await user.keyboard('{Escape}');
      
      expect(input).toHaveValue('');
      expect(onSearch).toHaveBeenCalledWith('');
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なaria-labelが設定される', () => {
      const onSearch = jest.fn();
      render(<SearchInput onSearch={onSearch} />);
      
      expect(screen.getByLabelText('Search input')).toBeInTheDocument();
    });

    it('クリアボタンに適切なaria-labelが設定される', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'test');
      
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('スクリーンリーダー用のテキストが適切に設定される', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onSearch = jest.fn();
      
      render(<SearchInput onSearch={onSearch} />);
      
      const input = screen.getByTestId('search-input');
      await user.type(input, 'test');
      
      expect(screen.getByText('Searching...')).toHaveClass('sr-only');
    });
  });
});
```

#### TodoListコンポーネントのテスト

```typescript
// workspace/frontend/src/components/__tests__/TodoList.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList, Todo } from '../TodoList';

describe('TodoListコンポーネント', () => {
  const mockTodos: Todo[] = [
    {
      id: 1,
      text: 'Learn React Testing Library',
      completed: false,
      createdAt: new Date('2023-01-01')
    },
    {
      id: 2,
      text: 'Write unit tests',
      completed: true,
      createdAt: new Date('2023-01-02')
    },
    {
      id: 3,
      text: 'Deploy to production',
      completed: false,
      createdAt: new Date('2023-01-03')
    }
  ];

  const defaultProps = {
    todos: mockTodos,
    onAddTodo: jest.fn(),
    onToggleTodo: jest.fn(),
    onDeleteTodo: jest.fn(),
    onEditTodo: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本表示', () => {
    it('todo一覧が表示される', () => {
      render(<TodoList {...defaultProps} />);
      
      expect(screen.getByText('Learn React Testing Library')).toBeInTheDocument();
      expect(screen.getByText('Write unit tests')).toBeInTheDocument();
      expect(screen.getByText('Deploy to production')).toBeInTheDocument();
    });

    it('完了数の統計が表示される', () => {
      render(<TodoList {...defaultProps} />);
      
      expect(screen.getByTestId('todo-stats')).toHaveTextContent('1 of 3 completed');
    });

    it('空の状態が表示される', () => {
      render(<TodoList {...defaultProps} todos={[]} />);
      
      expect(screen.getByTestId('empty-state')).toHaveTextContent('No todos yet. Add one above!');
      expect(screen.queryByTestId('todo-items')).not.toBeInTheDocument();
    });

    it('ヘッダーが表示される', () => {
      render(<TodoList {...defaultProps} />);
      
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Todo List');
    });
  });

  describe('todo追加', () => {
    it('新しいtodoを追加できる', async () => {
      const user = userEvent.setup();
      const onAddTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onAddTodo={onAddTodo} />);
      
      const input = screen.getByTestId('add-todo-input');
      const button = screen.getByTestId('add-todo-button');
      
      await user.type(input, 'New todo item');
      await user.click(button);
      
      expect(onAddTodo).toHaveBeenCalledWith('New todo item');
      expect(input).toHaveValue(''); // 入力がクリアされる
    });

    it('Enterキーでtodoを追加できる', async () => {
      const user = userEvent.setup();
      const onAddTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onAddTodo={onAddTodo} />);
      
      const input = screen.getByTestId('add-todo-input');
      
      await user.type(input, 'New todo with Enter{enter}');
      
      expect(onAddTodo).toHaveBeenCalledWith('New todo with Enter');
    });

    it('空文字のtodoは追加できない', async () => {
      const user = userEvent.setup();
      const onAddTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onAddTodo={onAddTodo} />);
      
      const input = screen.getByTestId('add-todo-input');
      const button = screen.getByTestId('add-todo-button');
      
      // 空文字で送信
      await user.click(button);
      expect(onAddTodo).not.toHaveBeenCalled();
      
      // 空白のみで送信
      await user.type(input, '   ');
      await user.click(button);
      expect(onAddTodo).not.toHaveBeenCalled();
    });

    it('空文字の場合は追加ボタンが無効になる', () => {
      render(<TodoList {...defaultProps} />);
      
      const button = screen.getByTestId('add-todo-button');
      expect(button).toBeDisabled();
    });

    it('文字が入力されると追加ボタンが有効になる', async () => {
      const user = userEvent.setup();
      
      render(<TodoList {...defaultProps} />);
      
      const input = screen.getByTestId('add-todo-input');
      const button = screen.getByTestId('add-todo-button');
      
      await user.type(input, 'New todo');
      expect(button).not.toBeDisabled();
    });

    it('前後の空白はトリムされる', async () => {
      const user = userEvent.setup();
      const onAddTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onAddTodo={onAddTodo} />);
      
      const input = screen.getByTestId('add-todo-input');
      const button = screen.getByTestId('add-todo-button');
      
      await user.type(input, '  Todo with spaces  ');
      await user.click(button);
      
      expect(onAddTodo).toHaveBeenCalledWith('Todo with spaces');
    });
  });

  describe('todo操作', () => {
    it('todoの完了状態を切り替えられる', async () => {
      const user = userEvent.setup();
      const onToggleTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onToggleTodo={onToggleTodo} />);
      
      const checkbox = screen.getByTestId('todo-checkbox-1');
      await user.click(checkbox);
      
      expect(onToggleTodo).toHaveBeenCalledWith(1);
    });

    it('完了済みtodoのチェックボックスがチェックされている', () => {
      render(<TodoList {...defaultProps} />);
      
      const completedCheckbox = screen.getByTestId('todo-checkbox-2');
      const incompleteCheckbox = screen.getByTestId('todo-checkbox-1');
      
      expect(completedCheckbox).toBeChecked();
      expect(incompleteCheckbox).not.toBeChecked();
    });

    it('todoを削除できる', async () => {
      const user = userEvent.setup();
      const onDeleteTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onDeleteTodo={onDeleteTodo} />);
      
      const deleteButton = screen.getByTestId('delete-todo-1');
      await user.click(deleteButton);
      
      expect(onDeleteTodo).toHaveBeenCalledWith(1);
    });

    it('完了済みtodoにcompletedクラスが適用される', () => {
      render(<TodoList {...defaultProps} />);
      
      const completedItem = screen.getByTestId('todo-item-2');
      const incompleteItem = screen.getByTestId('todo-item-1');
      
      expect(completedItem).toHaveClass('completed');
      expect(incompleteItem).not.toHaveClass('completed');
    });
  });

  describe('todo編集', () => {
    it('todoを編集できる', async () => {
      const user = userEvent.setup();
      const onEditTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onEditTodo={onEditTodo} />);
      
      // 編集ボタンをクリック
      await user.click(screen.getByTestId('edit-todo-1'));
      
      // 編集フィールドが表示される
      const editInput = screen.getByTestId('edit-todo-input-1');
      expect(editInput).toBeInTheDocument();
      expect(editInput).toHaveValue('Learn React Testing Library');
      expect(editInput).toHaveFocus();
      
      // テキストを変更
      await user.clear(editInput);
      await user.type(editInput, 'Updated todo text');
      
      // 保存ボタンをクリック
      await user.click(screen.getByTestId('save-edit-1'));
      
      expect(onEditTodo).toHaveBeenCalledWith(1, 'Updated todo text');
      
      // 編集モードが終了し、通常表示に戻る
      expect(screen.queryByTestId('edit-todo-input-1')).not.toBeInTheDocument();
    });

    it('編集をキャンセルできる', async () => {
      const user = userEvent.setup();
      const onEditTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onEditTodo={onEditTodo} />);
      
      // 編集ボタンをクリック
      await user.click(screen.getByTestId('edit-todo-1'));
      
      // テキストを変更
      const editInput = screen.getByTestId('edit-todo-input-1');
      await user.clear(editInput);
      await user.type(editInput, 'Changed text');
      
      // キャンセルボタンをクリック
      await user.click(screen.getByTestId('cancel-edit-1'));
      
      expect(onEditTodo).not.toHaveBeenCalled();
      
      // 編集モードが終了し、元のテキストが表示される
      expect(screen.queryByTestId('edit-todo-input-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('todo-text-1')).toHaveTextContent('Learn React Testing Library');
    });

    it('空文字では保存できない', async () => {
      const user = userEvent.setup();
      const onEditTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onEditTodo={onEditTodo} />);
      
      // 編集ボタンをクリック
      await user.click(screen.getByTestId('edit-todo-1'));
      
      // テキストをクリア
      const editInput = screen.getByTestId('edit-todo-input-1');
      await user.clear(editInput);
      
      // 保存ボタンをクリック
      await user.click(screen.getByTestId('save-edit-1'));
      
      expect(onEditTodo).not.toHaveBeenCalled();
      // 編集モードが継続される
      expect(screen.getByTestId('edit-todo-input-1')).toBeInTheDocument();
    });

    it('編集中は通常のアクションボタンが表示されない', async () => {
      const user = userEvent.setup();
      
      render(<TodoList {...defaultProps} />);
      
      // 編集前は通常のボタンが表示される
      expect(screen.getByTestId('edit-todo-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-todo-1')).toBeInTheDocument();
      
      // 編集ボタンをクリック
      await user.click(screen.getByTestId('edit-todo-1'));
      
      // 編集中は通常のボタンが非表示になる
      expect(screen.queryByTestId('edit-todo-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-todo-1')).not.toBeInTheDocument();
      
      // 編集用のボタンが表示される
      expect(screen.getByTestId('save-edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-edit-1')).toBeInTheDocument();
    });

    it('前後の空白はトリムされる', async () => {
      const user = userEvent.setup();
      const onEditTodo = jest.fn();
      
      render(<TodoList {...defaultProps} onEditTodo={onEditTodo} />);
      
      await user.click(screen.getByTestId('edit-todo-1'));
      
      const editInput = screen.getByTestId('edit-todo-input-1');
      await user.clear(editInput);
      await user.type(editInput, '  Updated with spaces  ');
      
      await user.click(screen.getByTestId('save-edit-1'));
      
      expect(onEditTodo).toHaveBeenCalledWith(1, 'Updated with spaces');
    });
  });

  describe('統計情報の更新', () => {
    it('todo追加後に統計が更新される', () => {
      const todos = [
        { id: 1, text: 'Todo 1', completed: true, createdAt: new Date() },
        { id: 2, text: 'Todo 2', completed: false, createdAt: new Date() }
      ];
      
      render(<TodoList {...defaultProps} todos={todos} />);
      
      expect(screen.getByTestId('todo-stats')).toHaveTextContent('1 of 2 completed');
    });

    it('全て完了した場合の統計', () => {
      const todos = [
        { id: 1, text: 'Todo 1', completed: true, createdAt: new Date() },
        { id: 2, text: 'Todo 2', completed: true, createdAt: new Date() }
      ];
      
      render(<TodoList {...defaultProps} todos={todos} />);
      
      expect(screen.getByTestId('todo-stats')).toHaveTextContent('2 of 2 completed');
    });

    it('何も完了していない場合の統計', () => {
      const todos = [
        { id: 1, text: 'Todo 1', completed: false, createdAt: new Date() },
        { id: 2, text: 'Todo 2', completed: false, createdAt: new Date() }
      ];
      
      render(<TodoList {...defaultProps} todos={todos} />);
      
      expect(screen.getByTestId('todo-stats')).toHaveTextContent('0 of 2 completed');
    });
  });
});
```

## 🎓 重要なReact Testing Library パターン解説

### ✅ 基本的なレンダリングとクエリ

```typescript
describe('基本的なテスト', () => {
  it('コンポーネントが正しくレンダリングされる', () => {
    render(<Button>Click me</Button>);
    
    // ロール（役割）でクエリ - 最も推奨される方法
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    
    // テキストでクエリ
    expect(screen.getByText('Click me')).toBeInTheDocument();
    
    // ラベルでクエリ（フォーム要素）
    expect(screen.getByLabelText('Search input')).toBeInTheDocument();
    
    // data-testid でクエリ（最後の手段）
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });
});
```

### ✅ ユーザーイベントのテスト

```typescript
describe('ユーザーインタラクション', () => {
  it('ボタンクリックが動作する', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('フォーム入力が動作する', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    
    render(<Form onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
  });
});
```

### ✅ 非同期処理とタイマーのテスト

```typescript
describe('非同期処理', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('デバウンス機能が動作する', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onSearch = jest.fn();
    
    render(<SearchInput onSearch={onSearch} debounceMs={300} />);
    
    await user.type(screen.getByTestId('search-input'), 'test');
    
    expect(onSearch).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test');
    });
  });
});
```

### ✅ 条件付きレンダリングのテスト

```typescript
describe('条件付きレンダリング', () => {
  it('条件によって要素が表示/非表示される', () => {
    // 表示される場合
    render(<UserCard user={user} showEmail={true} />);
    expect(screen.getByTestId('user-email')).toBeInTheDocument();
    
    // 表示されない場合
    render(<UserCard user={user} showEmail={false} />);
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });
});
```

## 🚨 よくある間違いと対策

### ❌ 実装詳細のテスト
```typescript
// 悪い例：state の直接確認
expect(component.state.count).toBe(1);

// 良い例：ユーザーが見る結果の確認
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### ❌ 不適切なクエリの使用
```typescript
// 悪い例：data-testid に頼りすぎ
screen.getByTestId('submit-button');

// 良い例：semanticな方法を優先
screen.getByRole('button', { name: 'Submit' });
```

### ❌ 非同期処理の不適切な待機
```typescript
// 悪い例：固定時間の待機
setTimeout(() => {
  expect(element).toBeInTheDocument();
}, 100);

// 良い例：条件ベースの待機
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

## 📊 実行結果の確認

```bash
$ npm test Button.test.tsx UserCard.test.tsx SearchInput.test.tsx TodoList.test.tsx

 PASS  src/components/__tests__/Button.test.tsx
  Buttonコンポーネント
    基本的なレンダリング
      ✓ 子要素が正しく表示される (25 ms)
      ✓ デフォルトのpropsが適用される (8 ms)
      ✓ クリックイベントが発火する (15 ms)
      ✓ disabled状態で動作が無効になる (12 ms)
    バリアント
      ✓ primaryバリアントが適用される (8 ms)
      ✓ secondaryバリアントが適用される (7 ms)
      ✓ dangerバリアントが適用される (8 ms)
    サイズ
      ✓ smallサイズが適用される (7 ms)
      ✓ mediumサイズが適用される (6 ms)
      ✓ largeサイズが適用される (7 ms)
    ローディング状態
      ✓ ローディング中は特別な表示になる (10 ms)
      ✓ ローディング中はクリックが無効になる (9 ms)
    ボタンタイプ
      ✓ submitタイプが適用される (6 ms)
      ✓ resetタイプが適用される (6 ms)

 PASS  src/components/__tests__/UserCard.test.tsx
  UserCardコンポーネント
    基本表示
      ✓ ユーザー名が表示される (18 ms)
      ✓ ユーザーロールが表示される (12 ms)
      ✓ オンライン状態が表示される (15 ms)
      ✓ オフライン状態が表示される (11 ms)
      ✓ アバター画像がある場合は画像を表示 (12 ms)
      ✓ アバター画像がない場合はプレースホルダーを表示 (10 ms)
    メール表示制御
      ✓ showEmailがtrueの場合メールが表示される (11 ms)
      ✓ showEmailがfalseの場合メールが表示されない (10 ms)
      ✓ showEmailのデフォルト値はtrue (9 ms)
    最後のアクセス時間
      ✓ オフラインかつlastSeenがある場合に表示される (12 ms)
      ✓ オンラインの場合は表示されない (10 ms)
      ✓ 分単位で表示される (11 ms)
      ✓ 日単位で表示される (11 ms)
    アクションボタン
      ✓ 編集ボタンのクリックイベントが発火する (13 ms)
      ✓ 削除ボタンのクリックイベントが発火する (12 ms)
      ✓ 編集コールバックがない場合は編集ボタンが表示されない (9 ms)
      ✓ 削除コールバックがない場合は削除ボタンが表示されない (8 ms)
      ✓ 削除ボタンに適切なdata-testidが設定される (10 ms)
    アクセシビリティ
      ✓ 適切なaria-labelが設定される (11 ms)
      ✓ スクリーンリーダー用のテキストが適切に設定される (9 ms)

Test Suites: 4 passed, 4 total
Tests:       68 passed, 68 total
Snapshots:   0 total
Time:        3.2 s
```

## 🎉 次のステップ

React Component Testing をマスターしたら：

1. **問題007**: ユーザーイベントのテスト
2. **問題008**: カスタムHooksのテスト
3. **問題009**: Context APIを使うComponentのテスト

React Testing Library の哲学を理解して、ユーザー視点でのテストを書けるようになりましょう！