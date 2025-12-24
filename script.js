document.addEventListener('DOMContentLoaded', function() {
    // Elementy DOM
    const nutaElement = document.getElementById('nuta');
    const strunaElement = document.getElementById('struna');
    const strunaNazwaElement = document.getElementById('struna-nazwa');
    const progElement = document.getElementById('prog');
    const wskazowkaElement = document.getElementById('wskazowka');
    const historiaLista = document.getElementById('historiaLista');
    
    // Przyciski
    const losujBtn = document.getElementById('losujBtn');
    const autoBtn = document.getElementById('autoBtn');
    const stopBtn = document.getElementById('stopBtn');
    const wyczyscBtn = document.getElementById('wyczyscBtn');
    
    // Checkboxy
    const pokazProgCheckbox = document.getElementById('pokazProg');
    const pokazNazweCheckbox = document.getElementById('pokazNazwe');
    const dzwiekCheckbox = document.getElementById('dzwiek');
    
    // Dźwięk
    const soundClick = document.getElementById('soundClick');
    
    // Dane
    const nuty = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const nazwyStrun = [
        'E (6 - najgrubsza)',
        'A (5)',
        'D (4)',
        'G (3)',
        'B (2)',
        'e (1 - najcieńsza)'
    ];
    
    // Zmienne
    let autoInterval = null;
    let historia = JSON.parse(localStorage.getItem('gitaraHistoria')) || [];
    
    // Inicjalizacja
    aktualizujHistorie();
    
    // Funkcja losująca
    function losuj() {
        // Losowanie
        const indeksNuty = Math.floor(Math.random() * nuty.length);
        const indeksStruny = Math.floor(Math.random() * 6);
        const prog = Math.floor(Math.random() * 13);
        
        // Aktualizacja UI
        nutaElement.textContent = nuty[indeksNuty];
        nutaElement.classList.add('pulse');
        
        strunaElement.textContent = indeksStruny + 1;
        strunaElement.classList.add('pulse');
        
        strunaNazwaElement.textContent = nazwyStrun[indeksStruny];
        
        progElement.textContent = prog;
        progElement.classList.add('pulse');
        
        // Aktualizacja wskazówki
        wskazowkaElement.textContent = 
            `Na strunie ${indeksStruny + 1} (${nazwyStrun[indeksStruny].split(' ')[0]}) ` +
            `na progu ${prog} masz nutę ${nuty[indeksNuty]}`;
        
        // Usuń animację po zakończeniu
        setTimeout(() => {
            nutaElement.classList.remove('pulse');
            strunaElement.classList.remove('pulse');
            progElement.classList.remove('pulse');
        }, 500);
        
        // Zapisz do historii
        const czas = new Date().toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const wpis = {
            czas: czas,
            nuta: nuty[indeksNuty],
            struna: indeksStruny + 1,
            strunaNazwa: nazwyStrun[indeksStruny].split(' ')[0],
            prog: prog
        };
        
        historia.unshift(wpis); // Dodaj na początek
        if (historia.length > 10) historia.pop(); // Ogranicz do 10 wpisów
        
        localStorage.setItem('gitaraHistoria', JSON.stringify(historia));
        aktualizujHistorie();
        
        // Odtwórz dźwięk jeśli zaznaczono
        if (dzwiekCheckbox.checked) {
            soundClick.currentTime = 0;
            soundClick.play().catch(e => console.log("Autoplay zablokowany"));
        }
    }
    
    // Funkcja aktualizująca historię
    function aktualizujHistorie() {
        historiaLista.innerHTML = '';
        
        if (historia.length === 0) {
            historiaLista.innerHTML = '<div class="history-item">Brak historii losowań</div>';
            return;
        }
        
        historia.forEach(wpis => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div>
                    <strong>${wpis.nuta}</strong> 
                    | Struna ${wpis.struna} (${wpis.strunaNazwa})
                    ${pokazProgCheckbox.checked ? `| Próg ${wpis.prog}` : ''}
                </div>
                <div class="time">${wpis.czas}</div>
            `;
            historiaLista.appendChild(item);
        });
    }
    
    // Funkcja aktualizacji widoczności progu
    function aktualizujWidocznoscProgu() {
        if (pokazProgCheckbox.checked) {
            progElement.parentElement.style.display = 'block';
        } else {
            progElement.parentElement.style.display = 'none';
        }
    }
    
    // Funkcja aktualizacji widoczności nazwy struny
    function aktualizujWidocznoscNazwy() {
        if (pokazNazweCheckbox.checked) {
            strunaNazwaElement.style.display = 'block';
        } else {
            strunaNazwaElement.style.display = 'none';
        }
    }
    
    // Event Listeners
    losujBtn.addEventListener('click', losuj);
    
    autoBtn.addEventListener('click', function() {
        if (autoInterval) {
            clearInterval(autoInterval);
        }
        
        autoInterval = setInterval(losuj, 3000);
        autoBtn.disabled = true;
        stopBtn.disabled = false;
        losujBtn.disabled = true;
        
        autoBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Auto aktywny';
    });
    
    stopBtn.addEventListener('click', function() {
        if (autoInterval) {
            clearInterval(autoInterval);
            autoInterval = null;
        }
        
        autoBtn.disabled = false;
        stopBtn.disabled = true;
        losujBtn.disabled = false;
        
        autoBtn.innerHTML = '<i class="fas fa-play"></i> Tryb Auto (3s)';
    });
    
    wyczyscBtn.addEventListener('click', function() {
        if (confirm('Czy na pewno chcesz wyczyścić historię?')) {
            historia = [];
            localStorage.removeItem('gitaraHistoria');
            aktualizujHistorie();
        }
    });
    
    pokazProgCheckbox.addEventListener('change', aktualizujWidocznoscProgu);
    pokazNazweCheckbox.addEventListener('change', aktualizujWidocznoscNazwy);
    
    // Inicjalizacja widoczności
    aktualizujWidocznoscProgu();
    aktualizujWidocznoscNazwy();
    
    // Pierwsze losowanie
    losuj();
    
    // Dodaj obsługę klawisza spacji
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && !autoInterval) {
            event.preventDefault();
            losuj();
        }
    });
    
    // Informacja o skrócie klawiszowym
    console.log('Tip: Naciśnij SPACJĘ aby losować!');
});