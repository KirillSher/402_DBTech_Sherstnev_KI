class Game {
    constructor(fieldSize) {
        this.targetNumber = Math.floor(Math.random() * fieldSize) + 1;
        this.attempts = 0;
        this.lastGuess = null;
        this.start_time = formatDate(new Date());
    }

    checkGuess(guess, fieldSize) {
        if (guess < 1 || guess > fieldSize) {
            return `Please enter a number between 1 and ${fieldSize}.`;
        }

        this.attempts++;
        const difference = Math.abs(guess - this.targetNumber);
        let feedback = this.getFeedback(difference);

        if (this.lastGuess !== null) {
            const previousDifference = Math.abs(this.lastGuess - this.targetNumber);
            feedback += this.getComparisonFeedback(difference, previousDifference);
        }

        this.lastGuess = guess;
        return feedback;
    }

    getFeedback(difference) {
        if (difference > 50) {
            return 'Very cold';
        } else if (difference > 20) {
            return 'Cold';
        } else if (difference > 10) {
            return 'Warm';
        } else if (difference > 5) {
            return 'Hot';
        } else if (difference > 0) {
            return 'Very hot';
        } else {
            return 'Correct';
        }
    }

    getComparisonFeedback(difference, previousDifference) {
        if (difference < previousDifference) {
            return ' and getting closer';
        } else if (difference > previousDifference) {
            return ' and getting farther';
        }
        return '';
    }

    isCorrectGuess(guess) {
        return guess === this.targetNumber;
    }

    getAttempts() {
        return this.attempts;
    }

    getTargetNumber() {
        return this.targetNumber;
    }
}