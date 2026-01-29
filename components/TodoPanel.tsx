import React, { useEffect, useState, useCallback } from 'react';
import { Plus, CheckSquare, Square, Loader2, RefreshCw, Calendar, List, Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, CalendarEvent } from '../types';
import * as fireStoreService from '../services/fireStoreService';
import * as calendarService from '../services/calendarService';
import { User } from 'firebase/auth';
import { CalendarView } from './CalendarView';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  user: User | null;
}

export const TodoPanel: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'todo' | 'calendar'>('todo');

  // Todo State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [todoLoading, setTodoLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Deletion state
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }
    setTodoLoading(true);
    try {
      const data = await fireStoreService.getTasks(user.uid);
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setTodoLoading(false);
    }
  }, [user]);

  const loadCalendar = useCallback(async () => {
    if (!user) {
      setEvents([]);
      return;
    }
    setCalendarLoading(true);
    try {
      const data = await calendarService.getCalendarEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load calendar", error);
    } finally {
      setCalendarLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'todo') loadTodos();
    if (activeTab === 'calendar') loadCalendar();
  }, [user, activeTab, loadTodos, loadCalendar]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;

    setProcessing(true);
    try {
      const tempId = Date.now().toString();
      const tempTask: Task = { id: tempId, text: newTask, done: false, userId: user.uid, order: tasks.length };
      setTasks(prev => [...prev, tempTask]);
      setNewTask('');

      await fireStoreService.addTask(user.uid, tempTask.text);
      loadTodos();
    } catch (error) {
      console.error("Error adding task", error);
      alert("할 일을 추가하는데 실패했습니다.");
    } finally {
      setProcessing(false);
    }
  };

  const handleToggle = async (task: Task) => {
    const newStatus = !task.done;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newStatus } : t));

    try {
      await fireStoreService.toggleTask(task.id, newStatus);
    } catch (error) {
      console.error("Error toggling task", error);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !newStatus } : t));
    }
  };

  const handleDelete = async (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fireStoreService.deleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task", error);
      loadTodos();
    } finally {
      setTaskToDelete(null);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination || !user) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);

    try {
      await fireStoreService.updateTasksOrder(items);
    } catch (error) {
      console.error("Error updating tasks order", error);
      loadTodos();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
      {/* Tab Header */}
      <div className="flex items-center border-b border-white/10">
        <button
          onClick={() => setActiveTab('todo')}
          className={`flex-1 p-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'todo' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
        >
          <List size={18} />
          할 일
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 p-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'calendar' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
        >
          <Calendar size={18} />
          일정
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative no-scrollbar">
        {!user ? (
          <div className="flex h-full flex-col items-center justify-center text-white/50 p-6 text-center">
            <p>로그인이 필요합니다.</p>
            <p className="text-xs mt-2">구글 로그인을 통해<br />할 일과 일정을 관리해보세요.</p>
          </div>
        ) : activeTab === 'todo' ? (
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs text-white/50">총 {tasks.length}개 (핸들을 드래그하여 순서 변경)</span>
              <button onClick={loadTodos} className="text-white/50 hover:text-white transition-colors">
                <RefreshCw size={14} className={todoLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {todoLoading && tasks.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-white/50 gap-2">
                <Loader2 className="animate-spin" /> 불러오는 중...
              </div>
            ) : (
              // @ts-ignore
              <DragDropContext onDragEnd={onDragEnd}>
                {/* @ts-ignore */}
                <Droppable droppableId="todos">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`group flex items-center gap-3 rounded-lg p-3 mb-3 bg-white/10 hover:bg-white/20 ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-purple-500 !bg-white/30' : ''}`}
                            >
                              <div {...provided.dragHandleProps} className="text-white/20 group-hover:text-white/40 cursor-grab active:cursor-grabbing px-1">
                                <GripVertical size={18} />
                              </div>
                              <button
                                onClick={() => handleToggle(task)}
                                className={`flex-shrink-0 transition-colors ${task.done ? 'text-purple-400' : 'text-white/50 hover:text-white'
                                  }`}
                              >
                                {task.done ? <CheckSquare size={22} /> : <Square size={22} />}
                              </button>
                              <span
                                className={`flex-1 text-sm font-medium transition-all break-words ${task.done ? 'text-white/30 line-through decoration-white/30' : 'text-white'
                                  }`}
                              >
                                {task.text}
                              </span>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-all duration-200"
                                title="삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
            {!todoLoading && tasks.length === 0 && (
              <div className="text-center text-white/30 mt-10">
                할 일이 없습니다.
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-full">
            <div className="flex justify-end p-4 pb-0">
              <button onClick={loadCalendar} className="text-white/50 hover:text-white transition-colors">
                <RefreshCw size={14} className={calendarLoading ? "animate-spin" : ""} />
              </button>
            </div>
            <CalendarView events={events} loading={calendarLoading} />
          </div>
        )}
      </div>

      {/* Input Area (Only for Todo) */}
      {user && activeTab === 'todo' && (
        <div className="border-t border-white/10 p-4">
          <form onSubmit={handleAddTask} className="relative">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="새로운 할 일 입력..."
              disabled={processing}
              className="w-full rounded-xl border border-white/10 bg-black/20 p-4 pr-12 text-white placeholder-white/40 backdrop-blur-sm transition-all focus:border-purple-500/50 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newTask.trim() || processing}
              className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white shadow-lg transition-all hover:bg-purple-500 disabled:bg-gray-600 disabled:opacity-50"
            >
              {processing ? <Loader2 className="animate-spin" size={18} /> : <Plus size={20} />}
            </button>
          </form>
        </div>
      )}

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="할 일 삭제"
        message="이 할 일을 목록에서 정말 삭제할까요? 삭제 후에는 복구할 수 없습니다."
      />
    </div>
  );
};