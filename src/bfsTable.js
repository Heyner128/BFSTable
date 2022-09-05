import {data} from './data';
import './styles.scss';
import {dropdown} from 'bootstrap';


class BFSTable {
    
    #table = document.querySelector('table[data-bfs-table]');
    #paginationSizes = [10,20,30]
    #paginationSize = this.#paginationSizes[0];
    #showingElements = [1,this.#paginationSize];
    #showingPages = null;
    #maxPages = null;
    #activePage = 1;

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

        const button = this.#createPaginationInfoButton(sizes);
        const ul = this.#createPaginationInfoDropDown(sizes, button);
        
        container.appendChild(button);
        container.appendChild(ul);

        return container;
    }

    #createPaginationInfoButton(sizes) {
        const button = document.createElement('button');
        button.className = 'btn btn-secondary dropdown-toggle';
        button.type = 'button';
        button.setAttribute('data-bs-toggle','dropdown');
        button.textContent = sizes[0];

        return button;
    }

    #createPaginationInfoDropDown(sizes, button) {
        const ul = document.createElement('ul');
        ul.className = 'dropdown-menu';
        sizes.forEach(
            (size)=> {
                const li = this.#createPaginationInfoDropDownElements(size, button);
                ul.appendChild(li);
            }
        );

        return ul;
    }

    #createPaginationInfoDropDownElements(size, button) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = size;
        a.className = 'dropdown-item';
        a.href = '#';
        a.onclick= function(event) {this.#dropdownHandler(button,event)}.bind(this);
        li.appendChild(a);
        return li;
    }

    #dropdownHandler(button, event) {
        button.textContent=event.target.textContent;
        this.#paginationSize = Number(button.textContent);
        this.#updateTable(1,this.#paginationSize);
    }

    #createPagination(numberOfPages) {
        const ul = document.createElement('ul');
        ul.className = 'pagination';

        const pages = numberOfPages>6?6:numberOfPages+1;

        this.#showingPages = [1, pages-1];

        for(let i=0;i<=pages;i++) {
            const li = document.createElement('li');
            li.className = 'page-item';

            const a = document.createElement('a');
            a.className = 'page-link';
            a.href="#";

            this.#addPaginationEventListeners(i, a, ul, li, pages);

            if(i==1) li.classList.add('active');
            li.appendChild(a);
            ul.appendChild(li);
        }

        return ul;
    }

    #addPaginationEventListeners(i, a, ul, li, pages) {
        if(i==0) {
            a.innerHTML = '&laquo;'
            a.onclick = function(event) {this.#previousButtonHandler(event)}.bind(this);
        } else if (i==pages) {
            a.innerHTML = '&raquo;'
            a.onclick = function(event) {this.#nextButtonHandler(event)}.bind(this);
        } else {
            a.textContent = i;
            li.id = 'button' + i;
            a.onclick = function(event) {this.#numbersButtonsHandler(event, ul, pages)}.bind(this);
            
        }
        return;
    }

    #numbersButtonsHandler(event, ul) {
        this.#activePage = Number(event.target.textContent);
        const initialElement = this.#paginationSize*(this.#activePage-1)+1;
        const finalElement = initialElement + (this.#paginationSize-1);

        const initialPage = this.#showingPages[0];
        const finalPage = this.#showingPages[1]; 
        ul.childNodes.forEach(
            (li)=>{
                const liid = li.id.match(/\d+/)?li.id.match(/\d+/)[0]:null;
                if(liid==event.target.textContent && Number(event.target.textContent)!=(finalPage)) {
                    li.classList.add('active');
                } else if(Number(event.target.textContent)!=(finalPage)) {
                    li.classList.remove('active');
                } else if(liid){
                    li.firstChild.textContent = Number(li.firstChild.textContent) +1; 
                    li.id=`button${Number(liid)+1}`;
                    this.#showingPages[0]=initialPage+1;
                    this.#showingPages[1]=finalPage+1;
                    
                }
            }
        )
        this.#updateTable(initialElement,finalElement);
    }

    #nextButtonHandler(event) {
        const parentLi = document.querySelector(`#button${this.#activePage+1}`);
        if(parentLi) {
            const nextButton  = parentLi.firstChild;
            nextButton.click();
        }
        
    }

    #previousButtonHandler(event) {
        const parentLi = document.querySelector(`#button${this.#activePage-1}`);
        if(parentLi) {
            const previousButton  = parentLi.firstChild;
            previousButton.click();
        }
        
    }

    #addDragAndDrop(tr) {

        tr.onpointerdown = this.#beginDragging.bind(this);
        tr.onpointerup = this.#endDragging;
    }

    #beginDragging(event) {
        event.target.parentNode.onpointermove = function(eventNest) {this.#drag.call(this,eventNest)}.bind(this);
        event.target.parentNode.classList.add('shadow', 'user-select-none');
        event.target.parentNode.setPointerCapture(event.pointerId);
    }



    #drag(event) {
        const trans = event.target.style.transform.match(/-?\d+/g)?Number(event.target.style.transform.match(/-?\d+/g)[0]):0;
        const isMovingOutsideTop = (event.target.parentNode.firstChild === event.target && (trans+event.offsetY)<0);
        const isMovingOutsideBottom = (event.target.parentNode.lastChild === event.target && (trans+event.offsetY-10)>0);
        if(!(isMovingOutsideTop || isMovingOutsideBottom)) event.target.style.transform = `translateY(${trans+event.offsetY}px)`;
        this.#calculateNodeMovementDirection(event.target,trans);
    }

    #calculateNodeMovementDirection(node, offset) {
        let direction = null;
        if(offset>node.offsetHeight/2) {
            direction = 'bottom'
            this.#moveNode(node, offset, direction);
        } else if (Math.abs(offset)>node.offsetHeight/2) {
            direction = 'top';
            this.#moveNode(node, offset, direction);
        }
    }


    #moveNode(node, offset, direction) {
        const oldChild = node.parentNode.removeChild(direction=='bottom'?node.nextSibling:node.previousSibling);
        node.parentNode.insertBefore(oldChild, direction=='bottom'?node:node.nextSibling);
        node.style.transform = `translateY(${offset-(node.offsetHeight*(direction=='bottom'?1:-1))}px)`;
    }

    #endDragging(event) {
        event.target.onpointermove  = null;
        event.target.classList.remove('shadow', 'user-select-none');
        event.target.style.transform = `translateY(0px)`;
        event.target.releasePointerCapture(event.pointerId);
    }
}

const bfsTable = new BFSTable(data);






