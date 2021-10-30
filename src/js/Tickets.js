const axios = require('axios');

const checkboxes = document.querySelectorAll('.filter-form__input')
const tabsBtns = document.querySelectorAll('.tickets-tabs__btn')
const cheapBtn = document.querySelector('#cheap')
const fastBtn = document.querySelector('#fast')
const list = document.querySelector('.tickets-list')

const URL = 'https://front-test.beta.aviasales.ru';
const instance = axios.create({ baseURL: URL });

let mainTickets;
let realTickets;

export class Tickets{

    static async getTickets() {
        let id;

        await instance.get('/search')
        .then(res => id = res.data.searchId)
        .catch(e => console.log(e))
    
        await instance.get(`/tickets?searchId=${id}`)
        .then(res => mainTickets = res.data.tickets)
        .catch(e => console.log(e))
        
        Tickets.init()
        Tickets.renderTickets(realTickets)
    }
    //принимает массив объектов
    static renderTickets(tickets){
        list.innerHTML = '';

        for(let i = 0; i < 5; i++){
            list.innerHTML += teplateTicket(tickets[i])
        }

    }

    static init(){
        realTickets = mainTickets;

        cheapBtn.addEventListener('click',Tickets.filterTickets)
        fastBtn.addEventListener('click',Tickets.filterTickets)

        checkboxes.forEach(item => item.addEventListener('change', Tickets.checkboxHandler))

    }

    static filterTickets(e){
        if(e.target.classList.contains('tickets-tabs__btn--active')){
            Tickets.removeActiveTabsBtns()
            e.target.classList.add('tickets-tabs__btn--active')
        }

        let tickets = realTickets;
        if(e.target.id == 'cheap'){
            tickets = tickets.sort((a,b) => a.price - b.price)
            Tickets.renderTickets(tickets)
            return
        }
        if(e.target.id == 'fast'){
            tickets = tickets.sort((a,b) => a.segments[0].duration - b.segments[0].duration)
            Tickets.renderTickets(tickets)
        }
    }

    static checkboxHandler({ target }){
        Tickets.removeActiveTabsBtns()
        let inputs = [...checkboxes]
        if(target.dataset.transfer === 'all' && target.checked === true){
            inputs.forEach(item => item.checked = false);
            target.checked = true;
            Tickets.filterCheckboxes([target]);
            Tickets.removeActiveTabsBtns()
            return;
        }
        if(checkboxes[0].checked && target.dataset.transfer !== 'all'){
            target.checked = false;
            return;
        }

        let filteredCheckbox = inputs.filter(item => item.checked === true)
        if(!filteredCheckbox.length){
            realTickets = mainTickets
            Tickets.renderTickets(realTickets)
            Tickets.removeActiveTabsBtns()
            return;
        }

        let activeCheckBoxes = inputs.filter(item => item.checked === true)
        Tickets.filterCheckboxes(activeCheckBoxes)
        Tickets.removeActiveTabsBtns()
        
    }
    //принимает массив инпутов( дом элементов )
    static filterCheckboxes(transfers){
        if(transfers[0].dataset.transfer === 'all'){
            realTickets = mainTickets;
            Tickets.renderTickets(realTickets)
            return;
        }

        let newRealTickets = [];

        for(let i = 0; i < transfers.length; i++){
            let n = transfers[i];

            let arr = mainTickets.filter(item => item.segments[0].stops.length == +n.dataset.transfer)
            let arr1 = arr.filter(item => item.segments[1].stops.length == +n.dataset.transfer)

            newRealTickets = [...arr1, ...newRealTickets]
        }
        realTickets = newRealTickets;
        Tickets.renderTickets(realTickets)
        return;

    }

    static removeActiveTabsBtns() {
        tabsBtns.forEach(item => item.classList.remove('tickets-tabs__btn--active'))
    }

    //принимает кол-во(число) и массив слов
    static declOfNum(n, text_forms){
        n = Math.abs(n) % 100; 
        var n1 = n % 10;
        if (n == 0) { return text_forms[3]; }
        if (n > 10 && n < 20) { return text_forms[2]; }
        if (n1 > 1 && n1 < 5) { return text_forms[1]; }
        if (n1 == 1) { return text_forms[0]; }
        return text_forms[2];
    }
}

const teplateTicket = (ticket) => {
    return `
        <li class="ticket">
            <a class="ticket_link" href="#" target="_blank" rel="noopener">
                <div class="ticket-header">
                    <div class="ticket-header__price">${ticket.price} Р</div>
                    <img class="ticket-header__img" src="http://pics.avs.io/99/36/${ticket.carrier}.png" alt="">
                </div>
                <div class="ticket-body">
                    <div class="ticket-item">
                        <div class="ticket-item__elem" id="route">
                            <div class="ticket-item__title ticket-item__title--gray">${ticket.segments[0].origin} - ${ticket.segments[0].destination}</div>
                            <div class="ticket-item__subtitle">${getRouteTime(ticket, 0)}</div>
                        </div>
                        <div class="ticket-item__elem" id="length">
                            <div class="ticket-item__title ticket-item__title--gray">В пути</div>
                            <div class="ticket-item__subtitle">${getTimeFromMins(ticket.segments[0].duration)}</div>
                        </div>
                        <div class="ticket-item__elem" id="stops">
                            <div class="ticket-item__title ticket-item__title--gray">${checkStops(ticket, 0)}</div>
                            <div class="ticket-item__subtitle">${ticket.segments[0].stops.join(',')}</div>
                        </div>
                    </div>
                    <div class="ticket-item">
                        <div class="ticket-item__elem" id="route">
                            <div class="ticket-item__title ticket-item__title--gray">${ticket.segments[1].origin} - ${ticket.segments[1].destination}</div>
                            <div class="ticket-item__subtitle">${getRouteTime(ticket, 1)}</div>
                        </div>
                        <div class="ticket-item__elem" id="length">
                            <div class="ticket-item__title ticket-item__title--gray">В пути</div>
                            <div class="ticket-item__subtitle">${getTimeFromMins(ticket.segments[1].duration)}</div>
                        </div>
                        <div class="ticket-item__elem" id="stops">
                            <div class="ticket-item__title ticket-item__title--gray">${checkStops(ticket, 1)}</div>
                            <div class="ticket-item__subtitle">${ticket.segments[1].stops.join(',')}</div>
                        </div>
                    </div>
                </div>
            </a>
        </li>
    `;
}

const getTimeFromMins = (mins) => {
    let hours = Math.trunc(mins/60);
    let minutes = mins % 60;
    return `${hours}ч ${minutes}м`;
};

//принимает билет и номер элемента в массиве сигментов билета
const getRouteTime = (ticket, num) =>{
    let departure = ticket.segments[num].date.match(/[0-9][0-9]:[0-9][0-9]/)[0];// время вылета
    let departureDate = new Date(ticket.segments[num].date);

    const d = new Date(departureDate.setMinutes(departureDate.getMinutes() + ticket.segments[num].duration));
    let arrival = d.toString().match(/[0-9][0-9]:[0-9][0-9]/)[0];//время прилета
    return `${departure} - ${arrival}`;
}

//принимает билет и номер элемента в массиве сигментов билета
const checkStops = (ticket, num) => {
    let arrayWords = ['Пересадка','Пересадки','Пересадок','Без пересадок'];
    let word = Tickets.declOfNum(ticket.segments[num].stops.length, arrayWords);
    let ticketLength = ticket.segments[num].stops.length
    return `${ticketLength > 0 ? ticketLength : ''} ${word}`;
}
