document.addEventListener('DOMContentLoaded', function() {
    // Sprawdź czy jesteśmy na stronie loterii
    if (!document.querySelector('.loteria-page')) return;
    
    // Elementy DOM
    const currentNoteElement = document.getElementById('currentNote');
    const noteNumberElement = currentNoteElement.querySelector('.note-number');
    const noteNameElement = currentNoteElement.querySelector('.note-name');
    const progressFillElement = document.getElementById('progressFill');
    const progressCounterElement = document.getElementById('progressCounter');
    const statusTextElement = document.getElementById('statusText');
    const historyNotesElement = document.getElementById('historyNotes');
    const remainingNotesElement = document.getElementById('remainingNotes');
    const completedNotesElement = document.getElementById('completedNotes');
    const timerElement = document.getElementById('timer');
    
    // Przyciski
    const drawBtn = document.getElementById('drawBtn');
    const resetBtn = document.getElementById('resetBtn');
    const autoBtn = document.getElementById('autoBtn');
    const stopBtn = document.getElementById('stopBtn');
    const soundToggleBtn = document.getElementById('soundToggle');
    
    // Dźwięki
    const soundDraw = document.getElementById('soundDraw');
    const soundComplete = document.getElementById('soundComplete');
    const soundReset = document.getElementById('soundReset');
    
    // Nuty 1-12 z nazwami
    const notes = [
        { number: 1, name: "C" },
        { number: 2, name: "C#" },
        { number: 3, name: "D" },
        { number: 4, name: "D#" },
        { number: 5, name: "E" },
        { number: 6, name: "F" },
        { number: 7, name: "F#" },
        { number: 8, name: "G" },
        { number: 9, name: "G#" },
        { number: 10, name: "A" },
        { number: 11, name: "A#" },
        { number: 12, name: "B" }
    ];
    
    // Zmienne stanu
    let availableNotes = [...notes];
    let drawnNotes = [];
    let autoInterval = null;
    let startTime = null;
    let timerInterval = null;
    let soundEnabled = true;
    let isCompleted = false;
    
    // Inicjalizacja
    initGame();
    updateTimer();
    updateAvailableNotesGrid();
    
    // Funkcja inicjalizująca grę
    function initGame() {
        availableNotes = [...notes];
        drawnNotes = [];
        isCompleted = false;
        startTime = new Date();
        
        updateUI();
        updateTimerDisplay();
        updateStatus("Kliknij 'LOSUJ' aby rozpocząć!");
        updateAvailableNotesGrid();
        updateCompletedNotesGrid();
        
        // Uruchom timer
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(updateTimerDisplay, 1000);
        
        // Zaktualizuj przyciski
        drawBtn.disabled = false;
        autoBtn.disabled = false;
        stopBtn.disabled = true;
        autoBtn.innerHTML = '<i class="fas fa-play"></i> AUTO LOSUJ (3s)';
        
        if (soundEnabled) {
            soundReset.currentTime = 0;
            soundReset.play().catch(e => console.log("Autoplay zablokowany"));
        }
    }
    
    // Funkcja losująca nutę
    function drawNote() {
        if (isCompleted || availableNotes.length === 0) {
            completeGame();
            return;
        }
        
        // Losowanie nuty
        const randomIndex = Math.floor(Math.random() * availableNotes.length);
        const drawnNote = availableNotes.splice(randomIndex, 1)[0];
        drawnNotes.unshift(drawnNote);
        
        // Animacja
        currentNoteElement.classList.add('pulse');
        setTimeout(() => currentNoteElement.classList.remove('pulse'), 500);
        
        // Aktualizacja UI
        updateUI();
        updateAvailableNotesGrid();
        updateCompletedNotesGrid();
        
        // Sprawdź czy gra się zakończyła
        if (availableNotes.length === 0) {
            completeGame();
        }
        
        // Odtwórz dźwięk
        if (soundEnabled) {
            soundDraw.currentTime = 0;
            soundDraw.play().catch(e => console.log("Autoplay zablokowany"));
        }
        
        return drawnNote;
    }
    
    // Funkcja kończąca grę
    function completeGame() {
        isCompleted = true;
        updateStatus("🎉 GRATULACJE! Wylosowałeś wszystkie 12 nut! 🎉");
        
        // Zaktualizuj przyciski
        drawBtn.disabled = true;
        autoBtn.disabled = true;
        stopBtn.disabled = true;
        
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
        }
        
        // Odtwórz dźwięk sukcesu
        if (soundEnabled) {
            soundComplete.currentTime = 0;
            soundComplete.play().catch(e => console.log("Autoplay zablokowany"));
        }
        
        // Pokaz konfetti
        showConfetti();
    }
    
    // Funkcja aktualizująca UI
    function updateUI() {
        // Aktualna nuta
        if (drawnNotes.length > 0) {
            const currentNote = drawnNotes[0];
            noteNumberElement.textContent = currentNote.number;
            noteNameElement.textContent = currentNote.name;
            currentNoteElement.style.background = 'linear-gradient(135deg, #f72585, #b5179e)';
        } else {
            noteNumberElement.textContent = "#";
            noteNameElement.textContent = "Kliknij 'Losuj'";
            currentNoteElement.style.background = 'linear-gradient(135deg, #4361ee, #3a0ca3)';
        }
        
        // Postęp
        const progress = (drawnNotes.length / notes.length) * 100;
        progressFillElement.style.width = `${progress}%`;
        progressCounterElement.textContent = `${drawnNotes.length}/12`;
        
        // Historia
        updateHistory();
        
        // Status
        if (!isCompleted && drawnNotes.length > 0) {
            updateStatus(`Wylosowano: Nutę ${drawnNotes[0].number} (${drawnNotes[0].name}) | Pozostało: ${availableNotes.length}`);
        }
    }
    
    // Aktualizacja historii
    function updateHistory() {
        historyNotesElement.innerHTML = '';
        
        if (drawnNotes.length === 0) {
            historyNotesElement.innerHTML = '<div class="empty-history">Brak wylosowanych nut</div>';
            return;
        }
        
        // Pokaż ostatnie 6 wylosowanych nut
        const recentNotes = drawnNotes.slice(0, 6);
        recentNotes.forEach((note, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item-loteria';
            historyItem.innerHTML = `
                <span class="history-number">${note.number}</span>
                <span class="history-name">${note.name}</span>
                ${index === 0 ? '<span class="history-current">(aktualna)</span>' : ''}
            `;
            historyNotesElement.appendChild(historyItem);
        });
    }
    
    // Aktualizacja dostępnych nut w gridzie
    function updateAvailableNotesGrid() {
        remainingNotesElement.innerHTML = '';
        
        availableNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item available';
            noteItem.innerHTML = `
                <div class="note-number-small">${note.number}</div>
                <div class="note-name-small">${note.name}</div>
            `;
            remainingNotesElement.appendChild(noteItem);
        });
    }
    
    // Aktualizacja wylosowanych nut w gridzie
    function updateCompletedNotesGrid() {
        completedNotesElement.innerHTML = '';
        
        drawnNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item completed';
            noteItem.innerHTML = `
                <div class="note-number-small">${note.number}</div>
                <div class="note-name-small">${note.name}</div>
            `;
            completedNotesElement.appendChild(noteItem);
        });
    }
    
    // Aktualizacja statusu
    function updateStatus(message) {
        statusTextElement.textContent = message;
        statusTextElement.classList.add('pulse');
        setTimeout(() => statusTextElement.classList.remove('pulse'), 500);
    }
    
    // Timer
    function updateTimer() {
        const now = new Date();
        startTime = now;
    }
    
    function updateTimerDisplay() {
        if (!startTime) return;
        
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        
        timerElement.textContent = `Czas: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Konfetti
    function showConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.background = getRandomColor();
                confetti.style.borderRadius = '50%';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                document.body.appendChild(confetti);
                
                // Animacja spadania
                confetti.animate([
                    { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                    { transform: `translateY(${window.innerHeight}px) rotate(${360 + Math.random() * 360}deg)`, opacity: 0 }
                ], {
                    duration: 2000 + Math.random() * 2000,
                    easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
                });
                
                // Usuń po animacji
                setTimeout(() => confetti.remove(), 3000);
            }, i * 100);
        }
    }
    
    function getRandomColor() {
        const colors = ['#4cc9f0', '#f72585', '#ffd166', '#06d6a0', '#7209b7'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Event Listeners
    drawBtn.addEventListener('click', drawNote);
    
    resetBtn.addEventListener('click', initGame);
    
    autoBtn.addEventListener('click', function() {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
        }
        
        if (!isCompleted) {
            autoInterval = setInterval(() => {
                if (!isCompleted) {
                    drawNote();
                } else {
                    clearInterval(autoInterval);
                }
            }, 3000);
            
            autoBtn.disabled = true;
            stopBtn.disabled = false;
            drawBtn.disabled = true;
            
            autoBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> AUTO AKTYWNY';
            updateStatus("Tryb auto aktywny - losowanie co 3 sekundy");
        }
    });
    
    stopBtn.addEventListener('click', function() {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
        }
        
        autoBtn.disabled = false;
        stopBtn.disabled = true;
        drawBtn.disabled = false;
        
        autoBtn.innerHTML = '<i class="fas fa-play"></i> AUTO LOSUJ (3s)';
        updateStatus("Tryb auto zatrzymany");
    });
    
    soundToggleBtn.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i> Dźwięk ON';
        } else {
            soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Dźwięk OFF';
        }
    });
    
    // Skróty klawiszowe
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && !autoInterval && !isCompleted) {
            event.preventDefault();
            drawNote();
        }
        
        if (event.code === 'KeyR' && event.ctrlKey) {
            event.preventDefault();
            initGame();
        }
        
        if (event.code === 'KeyA' && event.ctrlKey && !autoInterval) {
            event.preventDefault();
            autoBtn.click();
        }
    });
    
    // Zapisz aktualny tryb
    localStorage.setItem('lastMode', 'loteria');
});