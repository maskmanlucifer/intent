import { ArrowDownOutlined, ArrowUpOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import { Button, Collapse, Dropdown, Menu, message } from 'antd';
import "./index.scss";
import TodoItem from '../todo-item';
import classNames from 'classnames';
import { Subtask, Task } from '../../types';
import { addNewSubtask, moveTaskDown, moveTaskUp, addNewTask, changeCategoryOfTask } from '../../redux/todoSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ReactComponent as FocusIcon } from '../../assets/icons/focus.svg';
import { ReactComponent as FolderIcon } from '../../assets/icons/folder.svg';
import { RootState } from '../../redux/store';
import { useState } from 'react';
const TodoList = ({ selectedFolder, todos }: { selectedFolder: string, todos: Task[] }) => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const folders = useSelector((state: RootState) => state.categories.items);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  const genExtra = (task: Task) => {
    const isFirstTask = task.order === 1;
    const isLastTask = task.order === todos.length;
    const isFocused = focusedTask?.id === task.id;

    return (
      <div className='todo-actions'>
        {!isFirstTask && <ArrowUpOutlined onClick={() => dispatch(moveTaskUp({ id: task.id, order: task.order }))} />}
        {!isLastTask && <ArrowDownOutlined onClick={() => dispatch(moveTaskDown({ id: task.id, order: task.order }))} />}
        <FocusIcon className={classNames('focus-icon', {
          focused: isFocused,
        })} onClick={() => {
          if(isFocused) {
            setFocusedTask(null);
            messageApi.open({
              type: "success",
              content: "Task unfocused!",
            });
          } else {
            setFocusedTask(task);
            messageApi.open({
              type: "success",
              content: "Task focused!",
            });
          }
        }} />
        <Dropdown
          overlay={
            <Menu onClick={({ key }) => dispatch(changeCategoryOfTask({ id: task.id, categoryId: key }))}>
              <Menu.Item key='none' className='folder-move-item-to'>Move item to folder</Menu.Item>
              {folders.filter(folder => folder.id !== task.categoryId).map(folder => (
                <Menu.Item key={folder.id} className='folder-move-item'>
                  <FolderIcon />
                  {folder.name}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={['click']}
        >
          <SwapOutlined />
        </Dropdown>
      </div>
    )
  };

  const handleAddSubtask = (id: string, index: number) => {
    dispatch(addNewSubtask({ parentId: id, index }));
  }

  const finalTodos = focusedTask ? [focusedTask] : todos;

  return (
    <div className="todo-list">
      {contextHolder}
      <Collapse
        expandIconPosition={"end"}
      >
        {finalTodos.map((task, index) => (
          <Collapse.Panel header={<TodoItem todoItem={task} index={index} />} key={`${task.id}-${selectedFolder}`} extra={genExtra(task)} collapsible="header">
            <div className='subtasks'>
              {task.subtasks.map((subtask: Subtask, index: number) => (
                <TodoItem todoItem={subtask} key={`${subtask.id}-${selectedFolder}`} index={index} />
              ))}
              <Button type="primary" onClick={() => handleAddSubtask(task.id, task.subtasks.length)} 
              className={classNames('add-subtask-button', {
                haveSubtasks: task.subtasks.length > 0,
              })} icon={<PlusOutlined />} size='small'>{task.subtasks.length > 0 ? '': 'Add new subtask'}</Button>
            </div>
          </Collapse.Panel>
        ))}
      </Collapse>
      {focusedTask === null && todos.length > 0 && (
        <Button type="primary" onClick={() => dispatch(addNewTask({ categoryId: selectedFolder }))} className='add-task-button' icon={<PlusOutlined />} size='small'/>
      )}
    </div>
  );
};

export default TodoList;