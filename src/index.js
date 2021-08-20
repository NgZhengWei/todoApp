//TODO mobile responsive and improve interface

import { format } from 'date-fns';

const Logic = ( //module for backend logic
    function () {
        let idCount = 1; //count for allocating id to todos
        let projects = {}; //save categories and associated ids of todos
        let todos = []; //arr of all todo objects

        const addProject = (name) => {
            Logic.projects[name] = [];
            storage.saveProjects();
        }

        const addProjectFromForm = (e) => {
            e.preventDefault();
            let projectName = document.querySelector('#add-project-name').value;
            addProject(projectName);
            Interface.showProjects(Logic.projects);
            let addProjectArea = document.querySelector('.add-project');
            setTimeout(function (){addProjectArea.addEventListener('click', Interface.showAddProjectForm);}, 1);
            let projectsOnInteface = document.querySelectorAll('.sidebar-project');
            projectsOnInteface.forEach(project => project.addEventListener('click', Interface.changeActiveProject));
        };

        const todo = (title, description, dateDue, priority, project, done, id) => { //todo factory function
            let createdTodo;
            const setId = () => {
                return idCount++;
            };
        
            const getInfo = (attr) => {
                return data[attr];
            };
        
            const setInfo = (attr, val) => {
                data[attr] = val;
            };

            if (id == undefined) { //if todo is new
                console.log('new todo found')
                let data = {
                    id: setId(),
                    title: title,
                    description: description,
                    dateDue: dateDue,
                    priority: priority,
                    project: project,
                    done: done
                };
                createdTodo = {data, getInfo, setInfo};
                if (project === '') project = 'uncategorized';
                Logic.projects[project].push(data.id); //adds new todo to project list when created
                storage.saveProjects();
                todos.push(createdTodo); //add todo to todo array
                storage.saveId();
                storage.saveTodos();
            }
            else { // for todo recreation from localStorage
                let data = {
                    id: id,
                    title: title,
                    description: description,
                    dateDue: dateDue,
                    priority: priority,
                    project: project,
                    done: done
                };
                createdTodo = {data, getInfo, setInfo};
                console.log(`Loaded in existing TODO with id ${id}`)
            }
            return createdTodo;
        };

        const addTodoFromForm = (e) => {
            e.preventDefault();
            let todoName = document.querySelector('#add-todo-name').value;
            addTodo(todoName);
            Interface.showTodos(Logic.todos);
            let addTodoArea = document.querySelector('.add-todo');
            setTimeout(function (){addTodoArea.addEventListener('click', Interface.showAddTodoForm);}, 1);
        };

        const getActiveProject = () => {
            let projects = document.querySelectorAll('.sidebar-project');
            let activeProject;
            projects.forEach(project => {
                if (project.classList.contains('active-project')){
                    activeProject = project.innerText;
                }
            });
            return activeProject;
        }

        const addTodo = (todoName) => {
            let activeProject = getActiveProject();
            todo(todoName, '', '', '', activeProject, false);
        };

        const addDateFromForm = (e) => {
            let uid = e.target.getAttribute('id').slice(5);
            let date = e.target.value;
            for (let i = 0; i < todos.length; i++) {
                if (todos[i].data.id == uid) {
                    todos[i].data.dateDue = format(new Date(date), 'dd/MM/yyyy');
                }
            }
            storage.saveTodos();
            Interface.showTodos(todos);
        };

        const changeDoneStatus = (e) => {
            let uid = e.target.parentNode.parentNode.getAttribute('data-id');
            todos.forEach(todo => {
                if (todo.data.id == uid) {
                    if (todo.data.done === false) {
                        todo.data.done = true;
                    }
                    else {
                        todo.data.done = false;
                    }
                }
            });
            storage.saveTodos();
            Interface.showTodos(todos);
        }

        const deleteTodo = (e) => {
            let uid = e.target.parentNode.parentNode.parentNode.querySelector('.todo').getAttribute('data-id');
            if (confirm('Are you sure you want to task?')) {
                for (let i = 0; i < todos.length; i++) {
                    if (todos[i].data.id == uid) {
                        todos.splice(i, 1);
                    }
                }
                storage.saveTodos();
                Interface.showTodos(todos);
            }
        }

        const saveDescription = (e) => {
            let uid = e.target.parentNode.parentNode.querySelector('.todo').getAttribute('data-id');
            todos.forEach(todo => {
                if (todo.data.id == uid) {
                    todo.data.description = e.target.value;
                    storage.saveTodos();
                }
            });
        };

        const storage = ( //module for saving and reading from storage
            function () {
                const saveProjects = () => { //saves project arr
                    window.localStorage.setItem('projects', JSON.stringify(Logic.projects));
                };

                const getProjects = () => {
                    if (window.localStorage.getItem('projects') != undefined) {
                        Logic.projects = JSON.parse(window.localStorage.getItem('projects'));
                        console.log('loaded in projects');
                    }
                    else {
                        addProject('uncategorized');
                        console.log('no projects found');
                    }
                };

                const saveTodos = () => { //saves todo arr
                    window.localStorage.setItem('todos', JSON.stringify(todos));
                };

                const getTodos = () => {
                    if (window.localStorage.getItem('todos') != undefined) {
                        let tmpTodoArr = JSON.parse(window.localStorage.getItem('todos'));
                        for (let i = 0; i < tmpTodoArr.length; i++){
                            Logic.todos.push(todo(tmpTodoArr[i]['data']['title'], tmpTodoArr[i]['data']['description'], tmpTodoArr[i]['data']['dateDue'], tmpTodoArr[i]['data']['priority'], tmpTodoArr[i]['data']['project'], tmpTodoArr[i]['data']['done'], tmpTodoArr[i]['data']['id']));
                        }
                        console.log('loaded in todos');
                    }
                    else {
                        todo('Example Todo', 'Description area', '14/08/2021', 'low', 'uncategorized', false);
                        console.log('no todos found');
                    }
                };

                const saveId = () => {
                    window.localStorage.setItem('id', idCount);
                };

                const setId = () => {
                    idCount = window.localStorage.getItem('id');
                    console.log(`idCount: ${idCount}`);
                }

                return {saveProjects, getProjects, saveTodos, getTodos, saveId, setId};
            }
        )();

        return {
            todo,
            addProjectFromForm,
            projects,
            storage,
            todos,
            addTodoFromForm,
            addDateFromForm,
            getActiveProject,
            changeDoneStatus,
            deleteTodo,
            saveDescription
        }
    }
)();

const Interface = ( //module for controlling DOM
    function () {
        const projectArea = document.querySelector('#projects');
        const todoArea = document.querySelector('#todos');

        const showProjects = (projects) => {
            let counter = 1;
            projectArea.innerHTML = '<h2>Projects</h2>';
            for (let project in projects){
                let projectDiv = document.createElement('div');
                projectArea.appendChild(projectDiv);
                projectDiv.innerText = `${project}`;
                projectDiv.classList.add('sidebar-project');
                projectDiv.addEventListener('click', changeActiveProject);
                if (counter === 1) {
                    projectDiv.classList.add('active-project');
                }
                counter++;
            }
            let addProjectButton = document.createElement('div');
            projectArea.appendChild(addProjectButton);
            addProjectButton.innerText = '+ Add Project';
            addProjectButton.classList.add('add-project');
            addProjectButton.addEventListener('click', Interface.showAddProjectForm);
        }

        const showTodos = (todos) => {
            let activeProject = Logic.getActiveProject();
            todoArea.innerHTML = `<div class="todo-header">
                                    <div>Tasks</div>
                                    <div>Date Due</div>
                                </div>`;
            for (let i = 0; i < todos.length; i++){
                if (todos[i]['data']['project'] === activeProject){
                    let todoOuterDiv = document.createElement('div');
                    todoArea.appendChild(todoOuterDiv);
                    todoOuterDiv.classList.add('todo-outer');
                    let todoDiv = document.createElement('div');
                    todoOuterDiv.appendChild(todoDiv);
                    todoDiv.classList.add('todo');
                    todoDiv.setAttribute('data-id', todos[i]['data']['id'])
                    let checkbox = document.createElement('img');
                    checkbox.setAttribute('src', todos[i]['data']['done'] === false ?'./media/empty-checkbox.svg':'./media/filled-checkbox.svg');
                    checkbox.classList.add('checkbox');
                    checkbox.addEventListener('click', Logic.changeDoneStatus);
                    let task = document.createElement('div');
                    todoDiv.appendChild(task);
                    task.appendChild(checkbox);
                    task.classList.add('todo-task');
                    let taskText = document.createElement('p');
                    task.appendChild(taskText);
                    taskText.setAttribute('class', todos[i]['data']['done'] === true ? 'linethrough':'');
                    taskText.innerText = todos[i]['data']['title'];

                    let rightSide = document.createElement('div');
                    todoDiv.appendChild(rightSide);
                    rightSide.classList.add('todo-rightside');
                    let date = document.createElement('div');
                    rightSide.appendChild(date);
                    date.innerText = todos[i]['data']['dateDue'] === '' ? 'No Date': todos[i]['data']['dateDue'];
                    date.addEventListener('click', showDateSelector);
                    date.classList.add('todo-date');
                    let dropdownArrow = document.createElement('img');
                    rightSide.appendChild(dropdownArrow);
                    dropdownArrow.setAttribute('src', './media/down-arrow.svg');
                    dropdownArrow.classList.add('dropdown-arrow');
                    dropdownArrow.addEventListener('click', showTodoDropdown);
                }
            }
            let addTodo = document.createElement('div');
            todoArea.appendChild(addTodo);
            addTodo.innerText = '+ Add Task'
            addTodo.classList.add('add-todo');
            addTodo.addEventListener('click', showAddTodoForm);
        }

        const showAddTodoForm = () => {
            let addTodoArea = document.querySelector('.add-todo');
            addTodoArea.innerHTML = `
                <form>
                    <input type="text" id="add-todo-name">
                    <div class="todo-form-btns">
                        <button id="add-todo-submit">Save</button>
                        <button id="add-todo-cancel">Cancel</button>
                    </div>
                </form>`;
                document.querySelector('.add-todo').removeEventListener('click', showAddTodoForm);
                document.querySelector('#add-todo-cancel').addEventListener('click', removeAddTodoForm);
                document.querySelector('#add-todo-submit').addEventListener('click', Logic.addTodoFromForm);
        }

        const removeAddTodoForm = (e) => {
            e.preventDefault();
            let addTodoArea = document.querySelector('.add-todo');
            addTodoArea.innerHTML = '+ Add Task';
            setTimeout(function (){addTodoArea.addEventListener('click', showAddTodoForm);}, 1);
        };

        const showAddProjectForm = () => {
            let addProjectArea = document.querySelector('.add-project');
            addProjectArea.innerHTML = `
                <form>
                    <input type="text" id="add-project-name">
                    <div class="project-form-btns">
                        <button id="add-project-submit">Save</button>
                        <button id="add-project-cancel">Cancel</button>
                    </div>
                </form>`;
                document.querySelector('.add-project').removeEventListener('click', showAddProjectForm);
                document.querySelector('#add-project-cancel').addEventListener('click', removeAddProjectForm);
                document.querySelector('#add-project-submit').addEventListener('click', Logic.addProjectFromForm);
        };

        const removeAddProjectForm = (e) => {
            e.preventDefault();
            let addProjectArea = document.querySelector('.add-project');
            addProjectArea.innerHTML = '+ Add Project';
            setTimeout(function (){addProjectArea.addEventListener('click', showAddProjectForm);}, 1);
        };

        const showDateSelector = (e) => {
            let uid = e.target.parentNode.parentNode.getAttribute('data-id');
            e.target.innerHTML = `
            <input type="date" id="date-${uid}">
            `;
            document.querySelector(`#date-${uid}`).addEventListener('change', Logic.addDateFromForm);
        }

        const changeActiveProject = (e) => {
            let projects = document.querySelectorAll('.sidebar-project');
            for (let i = 0; i < projects.length; i++){
                projects[i].classList.remove('active-project');
            }
            e.target.classList.add('active-project');
            showTodos(Logic.todos);
        };

        const showTodoDropdown = (e) => {
            let todoOuterDiv = e.target.parentNode.parentNode.parentNode;
            if (todoOuterDiv.classList.contains('showing-dropdown')) {
                todoOuterDiv.querySelector('.dropdown-area').remove();
                todoOuterDiv.classList.remove('showing-dropdown');
            }
            else {
                let uid = todoOuterDiv.querySelector('.todo').getAttribute('data-id');
                let todoRef;
                Logic.todos.forEach(todo => {
                    if (todo.data.id == uid) todoRef = todo;
                });
                let dropdownArea = document.createElement('div');
                todoOuterDiv.appendChild(dropdownArea);
                dropdownArea.classList.add('dropdown-area');
                let description = document.createElement('textarea');
                dropdownArea.appendChild(description);
                description.value = todoRef.data.description;
                description.placeholder = 'Add notes/ description...';
                description.addEventListener('change', Logic.saveDescription);
                todoOuterDiv.classList.add('showing-dropdown');
                let iconArea = document.createElement('div');
                dropdownArea.appendChild(iconArea);
                iconArea.classList.add('dropdown-icons');
                let saveIcon = document.createElement('img');
                iconArea.appendChild(saveIcon);
                saveIcon.setAttribute('src', './media/save.svg');
                saveIcon.classList.add('save-icon');
                let deleteIcon = document.createElement('img');
                iconArea.appendChild(deleteIcon);
                deleteIcon.setAttribute('src', './media/trash-bin.svg');
                deleteIcon.classList.add('delete-icon');
                deleteIcon.addEventListener('click', Logic.deleteTodo);
            }
        };

        const toggleMobileMenu = () => {
            let leftbar = document.querySelector('#leftbar');
            leftbar.classList.toggle('invisible');
        };

        return {
            showProjects,
            showTodos,
            showAddProjectForm,
            showAddTodoForm,
            showDateSelector,
            changeActiveProject,
            toggleMobileMenu
        };
    }
)();

const Controller = ( //facilitate modules logic and interface
    function () {
        const initApp = () => {
            Logic.storage.getProjects();
            Logic.storage.getTodos();
            Logic.storage.setId();
            console.dir(Logic.projects);
            console.dir(Logic.todos);
            Interface.showProjects(Logic.projects);
            Interface.showTodos(Logic.todos);
            document.querySelector('.hamburger-menu').addEventListener('click', Interface.toggleMobileMenu);
        };

        return {
            initApp
        }
    }
)();

Controller.initApp();