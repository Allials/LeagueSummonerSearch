package main

import (
	"sync"
	"time"
)

type Todo struct {
	ID        int64     `json:"id"`
	Title     string    `json:"title"`
	Completed bool      `json:"completed"`
	CreatedAt time.Time `json:"createdAt"`
}

type TodoStore struct {
	mu     sync.Mutex
	nextID int64
	items  map[int64]*Todo
}

func NewTodoStore() *TodoStore {
	return &TodoStore{
		items: make(map[int64]*Todo),
	}
}

func (s *TodoStore) Create(title string) Todo {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.nextID++
	t := Todo{
		ID:        s.nextID,
		Title:     title,
		CreatedAt: time.Now(),
	}
	s.items[t.ID] = t
	return t
}

func (s *TodoStore) List() []Todo {
	s.mu.Lock()
	defer s.mu.Unlock()
}

func (s *TodoStore) Get(id int64) (Todo, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
}

func (s *TodoStore) Update(id int64, title string, completed bool) (Todo, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
}

func (s *TodoStore) Delete(id int64) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
}
