const vscode = require('vscode');

function activate(context) {
    const pomodoroProvider = new PomodoroProvider();
    vscode.window.registerTreeDataProvider('pomodoroTimerView', pomodoroProvider);

    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'extension.startPomodoro';
    statusBarItem.show();

    let startCommand = vscode.commands.registerCommand('extension.startPomodoro', function () {
        vscode.window.showInformationMessage('Pomodoro Timer Started!');
        pomodoroProvider.startTimer();
    });

    let pauseCommand = vscode.commands.registerCommand('extension.pausePomodoro', function () {
        vscode.window.showInformationMessage('Pomodoro Timer Paused!');
        pomodoroProvider.pauseTimer();
    });

    let resetCommand = vscode.commands.registerCommand('extension.resetPomodoro', function () {
        vscode.window.showInformationMessage('Pomodoro Timer Reset!');
        pomodoroProvider.resetTimer();
    });

    context.subscriptions.push(startCommand, pauseCommand, resetCommand, statusBarItem);
}

class PomodoroProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.time = 25 * 60; // 25 minutes
        this.phase = 'Ready';
        this.interval = null;
    }

    getTreeItem(element) {
        return element;
    }

    getChildren() {
        return Promise.resolve([
            new vscode.TreeItem(`Phase: ${this.phase} - ${this.formatTime(this.time)}`, vscode.TreeItemCollapsibleState.None),
            this.createButton('Start', 'extension.startPomodoro', 'play-circle'),
            this.createButton('Pause', 'extension.pausePomodoro', 'debug-pause'),
            this.createButton('Reset', 'extension.resetPomodoro', 'refresh')
        ]);
    }

    createButton(label, command, icon) {
        const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
        item.command = { command, title: label };
        item.iconPath = new vscode.ThemeIcon(icon);
        return item;
    }

    startTimer() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.phase = 'Work';
        this.interval = setInterval(() => {
            if (this.time > 0) {
                this.time--;
                this._onDidChangeTreeData.fire();
            } else {
                clearInterval(this.interval);
                vscode.window.showInformationMessage('Pomodoro session complete!');
                this.phase = 'Complete';
                this._onDidChangeTreeData.fire();
            }
        }, 1000);
    }

    pauseTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.phase = 'Paused';
            this._onDidChangeTreeData.fire();
        }
    }

    resetTimer() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.time = 25 * 60;
        this.phase = 'Ready';
        this._onDidChangeTreeData.fire();
    }

    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
