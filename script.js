let processes = [];

// BUTTON HIGHLIGHT
function setActiveButton(activeId) {
    let buttons = ["fcfsBtn", "sjfBtn", "rrBtn"];

    buttons.forEach(id => {
        document.getElementById(id).classList.remove("active-btn");
    });

    document.getElementById(activeId).classList.add("active-btn");
}

// ADD PROCESS
function addProcess() {
    let pid = document.getElementById("pid").value;
    let arrival = parseInt(document.getElementById("arrival").value);
    let burst = parseInt(document.getElementById("burst").value);

    if (!pid || isNaN(arrival) || isNaN(burst)) {
        alert("Please fill all fields properly");
        return;
    }

    processes.push({ pid, arrival, burst, originalBurst: burst });

    displayTable();

    document.getElementById("pid").value = "";
    document.getElementById("arrival").value = "";
    document.getElementById("burst").value = "";
}

// DISPLAY TABLE
function displayTable() {
    let table = document.getElementById("processTable");
    table.innerHTML = "";

    processes.forEach(p => {
        let row = `<tr>
            <td>${p.pid}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
        </tr>`;
        table.innerHTML += row;
    });
}

// ================= FCFS =================
function runFCFS() {
    setActiveButton("fcfsBtn");

    let sorted = [...processes].sort((a, b) => a.arrival - b.arrival);

    let time = 0;
    let result = "";
    let gantt = "";

    sorted.forEach(p => {
        if (time < p.arrival) time = p.arrival;

        let start = time;
        let finish = time + p.burst;

        let waiting = start - p.arrival;
        let turnaround = finish - p.arrival;

        result += `Process ${p.pid}: Waiting=${waiting}, Turnaround=${turnaround} <br>`;
        gantt += `<div class="box">${p.pid}</div>`;

        time = finish;
    });

    document.getElementById("output").innerHTML = result;
    document.getElementById("gantt").innerHTML = gantt;
}

// ================= SJF =================
function runSJF() {
    setActiveButton("sjfBtn");

    let time = 0;
    let result = "";
    let gantt = "";
    let processesCopy = [...processes];

    while (processesCopy.length > 0) {
        let available = processesCopy.filter(p => p.arrival <= time);

        if (available.length === 0) {
            time++;
            continue;
        }

        available.sort((a, b) => a.burst - b.burst);
        let current = available[0];

        let start = time;
        let finish = time + current.burst;

        let waiting = start - current.arrival;
        let turnaround = finish - current.arrival;

        result += `Process ${current.pid}: Waiting=${waiting}, Turnaround=${turnaround} <br>`;
        gantt += `<div class="box">${current.pid}</div>`;

        time = finish;
        processesCopy = processesCopy.filter(p => p !== current);
    }

    document.getElementById("output").innerHTML = result;
    document.getElementById("gantt").innerHTML = gantt;
}

// ================= ROUND ROBIN =================
function runRR() {
    setActiveButton("rrBtn");

    let quantum = 2;
    let time = 0;
    let result = "";
    let gantt = "";

    let remaining = processes.map(p => ({
        pid: p.pid,
        arrival: p.arrival,
        burst: p.burst,
        originalBurst: p.originalBurst,
        completion: 0
    }));

    let queue = [];

    while (true) {
        remaining.forEach(p => {
            if (p.arrival === time) {
                queue.push(p);
            }
        });

        if (queue.length === 0) {
            if (remaining.every(p => p.burst === 0)) break;
            time++;
            continue;
        }

        let current = queue.shift();

        let execTime = Math.min(quantum, current.burst);
        current.burst -= execTime;

        gantt += `<div class="box">${current.pid}</div>`;

        time += execTime;

        remaining.forEach(p => {
            if (p.arrival > time - execTime && p.arrival <= time) {
                queue.push(p);
            }
        });

        if (current.burst > 0) {
            queue.push(current);
        } else {
            current.completion = time;
        }
    }

    remaining.forEach(p => {
        let turnaround = p.completion - p.arrival;
        let waiting = turnaround - p.originalBurst;

        result += `Process ${p.pid}: Waiting=${waiting}, Turnaround=${turnaround} <br>`;
    });

    document.getElementById("output").innerHTML = result;
    document.getElementById("gantt").innerHTML = gantt;
}