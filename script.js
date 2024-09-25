document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('plinko-board');
    const dropButton = document.getElementById('drop-button');
    const result = document.getElementById('result');
    const balanceDisplay = document.getElementById('balance');
    const betAmountInput = document.getElementById('bet-amount');
    const multiplierSelect = document.getElementById('multiplier');

    let balance = 100;

    const createPegs = () => {
        const rows = 10;
        const cols = 9;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (row % 2 === 0 && col === 8) continue; // Skip the last peg in even rows
                const peg = document.createElement('div');
                peg.className = 'peg';
                peg.style.top = `${row * 40}px`;
                peg.style.left = `${col * 50 + (row % 2 === 0 ? 0 : 25)}px`;
                board.appendChild(peg);
            }
        }
    };

    const dropChip = () => {
        const betAmount = parseInt(betAmountInput.value);
        const multiplier = parseInt(multiplierSelect.value);
        if (betAmount > balance) {
            alert('Insufficient balance!');
            return;
        }

        const chip = document.createElement('div');
        chip.className = 'chip';
        board.appendChild(chip);
        let leftPosition = 240;
        let topPosition = 0;
        let velocity = 0;
        const gravity = 0.5; // Adjust gravity for speed of drop
        const bounceDamping = 0.7; // Energy loss on bounce

        balance -= betAmount; // Deduct bet amount
        balanceDisplay.textContent = `Balance: $${balance}`;

        const dropInterval = setInterval(() => {
            // Apply gravity
            velocity += gravity;
            topPosition += velocity;
            chip.style.top = `${topPosition}px`;

            // Check for collisions with pegs
            const pegElements = document.querySelectorAll('.peg');
            pegElements.forEach(peg => {
                const pegRect = peg.getBoundingClientRect();
                const chipRect = chip.getBoundingClientRect();

                // Check for collision
                if (
                    chipRect.bottom >= pegRect.top &&
                    chipRect.top <= pegRect.bottom &&
                    chipRect.right >= pegRect.left &&
                    chipRect.left <= pegRect.right
                ) {
                    // Collision detected
                    velocity = -velocity * bounceDamping; // Bounce
                    leftPosition += Math.random() < 0.5 ? -5 : 5; // Random direction
                }
            });

            // Check if chip has reached the bottom
            if (topPosition >= 400) {
                clearInterval(dropInterval);
                const landingZone = Math.floor(leftPosition / 50); // Determine landing zone
                const winnings = calculateWinnings(landingZone, betAmount, multiplier);
                balance += winnings;
                result.textContent = `You ${winnings > 0 ? "won" : "lost"} $${Math.abs(winnings)}!`;
                balanceDisplay.textContent = `Balance: $${balance}`;
            } else {
                leftPosition = Math.max(0, Math.min(leftPosition, 460)); // Keep within bounds
                chip.style.left = `${leftPosition}px`;
            }
        }, 30);
    };

    const calculateWinnings = (zone, betAmount, multiplier) => {
        const payoutMultiplier = [0, 0, 2, 4, 6, 8, 10, 15, 20, 25]; // Example multipliers
        return betAmount * (payoutMultiplier[zone] || 0) * multiplier - betAmount; // Subtract original bet
    };

    createPegs();
    dropButton.addEventListener('click', dropChip);
});
