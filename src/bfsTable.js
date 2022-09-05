import {data} from './data';
import './styles.scss';
import {button, dropdown} from 'bootstrap';


class BFSTable {
    
    #table = document.querySelector('table[data-bfs-table]');
    #paginationSizes = [10,20,30]
    #paginationSize = this.#paginationSizes[0];
    #showingElements = [1,this.#paginationSize];
    #activePage = null;

    constructor(dataJSON) {
        this.dataObject = JSON.parse(dataJSON);    
        this.appendTable();
    } 

    
    appendTable() {
        this.#table.className = 'table position-relative';
        this.#table.appendChild(this.#createTableHead());
        this.#table.appendChild(this.#createTableBody(this.#showingElements[0],this.#showingElements[1]));
        if(this.dataObject.length > this.#paginationSize) this.#table.insertAdjacentElement('afterend',this.#createTableCaption());
        

    }

    #createTableHead() {
        const head = document.createElement('thead');
        const tr = document.createElement('tr');
        Object.keys(this.dataObject[0]).forEach(
            (key) => {
                const th = document.createElement('th');
                th.textContent = key;
                tr.appendChild(th);
            }
        );
        head.appendChild(tr);
        return head;
    }


    #createTableBody(firstLine, lastLine) {
        const body = document.createElement('tbody');

        for(let i=firstLine;i<=lastLine;i++) {
            body.appendChild(
                this.#createTableLine(
                    this.dataObject[i-1]
                )
            )
        }
        return body;
    }


    #createTableLine(lineObject) {
        const tr = document.createElement('tr');
        Object.values(lineObject).forEach(
            value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            }
        );
        this.#addDragAndDrop(tr);
        return tr;
    }

    #createTableCaption() {
        const container = document.createElement('div');
        container.className = 'd-flex justify-content-between';
        container.appendChild(this.#createTablePaginationInfo(this.#paginationSizes,''));
        container.appendChild(this.#createPagination(Math.ceil(this.dataObject.length/this.#paginationSize)));
        return container;
    }

    #updateTable(start, end) {
        const tableBody = document.querySelector('table[data-bfs-table] tbody');
        this.#table.removeChild(tableBody);
        this.#showingElements = [start,end];
        this.#table.appendChild(this.#createTableBody(this.#showingElements[0],this.#showingElements[1]))

    }

    #createTablePaginationInfo(sizes, text) {
        const container = document.createElement('div');
        container.className = 'dropdown';
        container.textContent = text;
        const button = document.createElement('button');
        button.className = 'btn btn-secondary dropdown-toggle';
        button.type = 'button';
        button.setAttribute('data-bs-toggle','dropdown');
        button.textContent = sizes[0];
        this.#paginationSize = Number(button.textContent);
        const ul = document.createElement('ul');
        ul.className = 'dropdown-menu';
        sizes.forEach(
            (size)=> {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.textContent = size;
                a.className = 'dropdown-item';
                a.href = '#';
                a.onclick= function(event) {
                    button.textContent=event.target.textContent;
                    this.#paginationSize = Number(button.textContent);
                    this.#updateTable(1,this.#paginationSize);
                }.bind(this);
                li.appendChild(a);
                ul.appendChild(li);
            }
        );
        container.appendChild(button);
        container.appendChild(ul);

        return container;
    }

    #createPagination(numberOfPages) {
        const ul = document.createElement('ul');
        ul.className = 'pagination';
        const pages = numberOfPages>6?6:numberOfPages+1
        for(let i=0;i<=pages;i++) {
            const li = document.createElement('li');
            li.className = 'page-item';
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href="#"
            if(i==0) {
                a.innerHTML = '&laquo;'
                a.onclick = function(event) {
                    const previousButton  = document.querySelector(`#button${this.#activePage-1}`).firstChild;
                    previousButton.click();
                }.bind(this);
            } else if (i==pages) {
                a.innerHTML = '&raquo;'
                a.onclick = function(event) {
                    const nextButton  = document.querySelector(`#button${this.#activePage+1}`).firstChild;
                    nextButton.click();
                }.bind(this);
            } else {
                a.textContent = i;
                li.id = 'button' + i;
                a.onclick = function(event) {this.#numbersHandler(event, ul, li)}.bind(this);
            }
            
            li.appendChild(a);
            ul.appendChild(li);
        }
        return ul;
    }

    #numbersHandler(event, ul, li) {
        this.#activePage = Number(event.target.textContent);
        const initialElement = this.#paginationSize*(this.#activePage-1)+1;
        const finalElement = initialElement + (this.#paginationSize-1);
        ul.childNodes.forEach(
            (li)=>{
                const liid = li.id.match(/\d+/)?li.id.match(/\d+/)[0]:null
                if(liid==event.target.textContent) {
                    li.classList.add('active');
                } else {
                    li.classList.remove('active');
                }
            }
        )
        this.#updateTable(initialElement,finalElement);
    }

    #addDragAndDrop(tr) {

        tr.onpointerdown = this.#beginDragging;
        tr.onpointerup = this.#endDragging;
    }

    #beginDragging(event) {
        const dragHandler = function (event) {
            const trans = event.target.style.transform.match(/-?\d+/g)?Number(event.target.style.transform.match(/-?\d+/g)[0]):0;
            const isMovingOutsideTop = (event.target.parentNode.firstChild === event.target && (trans+event.offsetY-10)<0);
            const isMovingOutsideBottom = (event.target.parentNode.lastChild === event.target && (trans+event.offsetY-10)>0);
            if(!(isMovingOutsideTop || isMovingOutsideBottom)) event.target.style.transform = `translateY(${trans+event.offsetY-10}px)`;
            if(trans>event.target.offsetHeight/2) {
                moveOnePosition(event.target,trans,'bottom');
            } else if (Math.abs(trans)>event.target.offsetHeight/2) {
                moveOnePosition(event.target,trans,'top');
            }
        }

        const moveOnePosition = function (node, offset, direction) {
            const oldChild = node.parentNode.removeChild(direction=='bottom'?node.nextSibling:node.previousSibling);
            node.parentNode.insertBefore(oldChild, direction=='bottom'?node:node.nextSibling);
            node.style.transform = `translateY(${offset-(node.offsetHeight*(direction=='bottom'?1:-1))}px)`;
        }

        event.target.parentNode.onpointermove = dragHandler;
        event.target.parentNode.classList.add('shadow', 'user-select-none');
        event.target.parentNode.setPointerCapture(event.pointerId);
    }

    #endDragging(event) {
        event.target.onpointermove  = null;
        event.target.classList.remove('shadow', 'user-select-none');
        event.target.style.transform = `translateY(0px)`;
        event.target.releasePointerCapture(event.pointerId);
    }
}

const bfsTable = new BFSTable(data);






