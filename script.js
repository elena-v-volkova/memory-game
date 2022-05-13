(function () {
    {
        //создаем и возвращаем форму для выбора количества карточек
        const createForm = () => {
            let form = document.createElement('form');
            let input = document.createElement('input');
            let buttonWrapper = document.createElement('div');
            let button = document.createElement('button');
            let text = document.createElement('p');

            text.classList.add('form-desc')
            text.innerText = 'Задайте количество карточек по вертикали/горизонтали и нажмите "Начать игру". В поле можно ввести чётное число от 2 до 10. Если указать другое число, то применится количество по-умолчанию - 4'
            form.classList.add('form');
            input.classList.add('form-input');
            input.placeholder = '4';
            button.classList.add('btn');
            buttonWrapper.classList.add('input-group');
            button.textContent = 'Начать игру';

            buttonWrapper.append(input);
            buttonWrapper.append(button);
            form.append(text);
            form.append();
            form.append(buttonWrapper);

            // добавление полей таймера
            let timeWrapper = document.createElement('div')
            let timeText = document.createElement('p')
            let timeShow = document.createElement('p')

            timeWrapper.classList.add('timewrapper');
            timeText.classList.add('timetext');
            timeShow.classList.add('timeshow');

            timeText.innerText = 'Осталось секунд:'

            timeWrapper.append(timeText);
            timeWrapper.append(timeShow);

            form.append(timeWrapper);

            return {
                form,
                input,
                button,
                timeShow,
            };
        }

        const form = createForm();
        // timer
        let intervId;

        const stopTimer = () => {
            clearInterval(intervId);
            intervId = null;
        }
        function setTimer() {
            form.timeShow.innerText = '60'
            if (!intervId) {
                intervId = setInterval(stepDown, 1000);
            }
        }
        function stepDown() {
            let interval = form.timeShow.innerText;
            if (form.timeShow.innerText > 0) {
                interval--;
                form.timeShow.innerText = interval;
            } else {
                let overlay = document.querySelector('.overlay')
                overlay.classList.remove('hidden')
                stopTimer();
                setTimeout(() => {
                    start();
                }, 1800);
            }
        }

        // Количество карточек из инпута 

        let numberFromInput = 4;
        let line;
        let card;

        form.form.addEventListener('submit', function (e) {
            e.preventDefault();
            numberFromInput = form.input.value;
            if (numberFromInput > 10 || numberFromInput % 2 !== 0 || numberFromInput === undefined || numberFromInput === '') {
                form.input.value = 4;
                numberFromInput = form.input.value;
            }
            // Начать игру
            start();
            setTimer();

        });

        const start = () => {
            if (document.querySelector('.newgamebtn')) {
                document.querySelector('.newgamebtn').remove();
            }
            form.form.remove();
            document.querySelector('.field').remove();
            createMatchGame();
        }

        function createField(cardsLinesNumber = 4) {
            document.body.append(form.form)

            const field = document.createElement('div');
            field.classList.add('field');

            overlay = document.createElement('div');
            overlay.className = "overlay hidden";

            overlayText = document.createElement('p');
            overlayText.className = "overlaytext";
            overlayText.innerText = 'Время вышло'

            overlay.append(overlayText);
            field.append(overlay);

            for (let i = 0; i < cardsLinesNumber; i++) {
                line = document.createElement('div');
                line.className = "line";

                field.append(line);

                for (let i = 0; i < cardsLinesNumber; i++) {
                    card = document.createElement('div');

                    img = document.createElement("IMG");
                    img.classList.add("back-face");
                    img.src = 'img/card.png';

                    card.className = "memory-card";
                    card.appendChild(img);
                    line.append(card);
                }
            }
            return {
                field,
                line,
                card,
                overlay,
            };
        };

        function createMatchGame() {
            let field = createField(numberFromInput);

            document.body.append(field.field);
            let cards = document.querySelectorAll('.memory-card');
            let cardsArray = Array.prototype.slice.call(cards);
            let count = 0;

            shuffle(cardsArray);


            for (let i = 0; i < cardsArray.length; i += 2) {
                count++;

                img = document.createElement("IMG");
                img.src = `img/${count}.png`;
                img.classList.add("front-face");
                cardsArray[i].setAttribute('data-value', count);
                cardsArray[i].appendChild(img);

                img2 = document.createElement("IMG");
                img2.src = `img/${count}.png`;
                img2.classList.add("front-face");
                cardsArray[i + 1].setAttribute('data-value', count);
                cardsArray[i + 1].appendChild(img2);
            };

            let hasFlippedCard = false;
            let boardLocked = false;
            let firstCard;
            let secondCard;

            const flipCard = e => {
                if (boardLocked) return;

                const target = e.target.parentElement;

                if (target === firstCard && target.className == 'memory-card flip') return;

                target.classList.add('flip')

                if (!hasFlippedCard) {
                    if (!intervId) {
                        setTimer()
                        console.log('hre')
                    };
                    hasFlippedCard = true;
                    firstCard = target;
                } else {
                    hasFlippedCard = false;
                    secondCard = target;

                    checkForMatch();
                }
                let allFlippedCards = document.querySelectorAll('.flip').length
                if (allFlippedCards === cardsArray.length) {
                    endGame();
                    stopTimer();
                }
            };
            //shuffle
            function shuffle(cardsArray) {
                for (let i = cardsArray.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    [cardsArray[i], cardsArray[j]] = [cardsArray[j], cardsArray[i]];
                }
            }
            // Opened cards are equal? 
            const checkForMatch = () => {
                const isEqual = firstCard.dataset.value === secondCard.dataset.value;
                isEqual ? disableCards() : unFlipCards();
            }
            // Disable opened equal cards
            const disableCards = () => {
                firstCard.removeEventListener('click', flipCard)
                secondCard.removeEventListener('click', flipCard)
            }
            // Unflip not equal cards
            const unFlipCards = () => {
                boardLocked = true;

                setTimeout(() => {
                    firstCard.classList.remove('flip');
                    secondCard.classList.remove('flip');

                    boardLocked = false;
                }, 900);
            }
            // End game 
            const endGame = () => {
                let startNewGameButton = document.createElement('button');
                startNewGameButton.classList.add('newgamebtn');
                startNewGameButton.textContent = "Начать новую игру"

                field.field.append(startNewGameButton);

                startNewGameButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    form.timeShow.innerText = '60'
                    document.querySelector('.newgamebtn').remove();
                    start();
                });


            };

            cards.forEach(card => {
                card.addEventListener('click', flipCard)
            });
        };
    }
    window.createMatchGame = createMatchGame;
})();

