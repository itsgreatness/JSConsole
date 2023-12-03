class Run {
    constructor(code) {
        this.source = code;
        try {
            this.output = eval?.(code);
            this.didError = false;
        } catch (e) {
            this.output = e.stack;
            this.didError = true;
            console._console.error(e);
        }
    }
}
class SimulatedConsole {
    constructor() {
        this._console = Object.freeze(window.console);
        this.counters = {};
        this.timers = {};
        this.indentLevel = null;
        this.isWaiting = false;
        this.output = null;
    }
    generatePropTree(obj, prefix) {
        const dropdown = Object.assign(document.createElement("details"), {
            source: obj,
            tabIndex: -1,
        });
        const snippet = Object.assign(document.createElement("summary"), {
            textContent: `${prefix ? prefix + ": " : ""}${obj.constructor.name} { ... }`,
        });
        const propList = document.createElement("ul");
        dropdown.append(snippet, propList);
        dropdown.addEventListener("toggle", event => {
            if (event.target.open && !event.target.OPENED) {
                for (const [key, value] of Object.entries(event.target.source)) {
                    if (value instanceof Object) {
                        propList.appendChild(this.generatePropTree(value, key))
                    } else {
                        propList.appendChild(Object.assign(document.createElement("li"), { textContent: `${key}: ${value}` }));
                    }
                }
                event.target.OPENED = true;
            }
        });
        return dropdown;
    }
    log(obj) {
        if (obj instanceof Object) {
            this.isWaiting = true;
            this.output = Object.assign(document.createElement("output"), {
                className: "log",
            });
            this.output.appendChild(this.generatePropTree(obj));
        } else {
            this.isWaiting = true;
            this.output = Object.assign(document.createElement("output"), {
                value: obj,
                className: "log",
            });
        }
    }
    count(name = "default") {
        if (!this.counters[name]) this.counters[name] = 0;
        this.log(++this.counters[name]);
    }
    countReset(name = "default") {
        if (!this.counters[name]) return this.warn(`Count for '${name}' does not exist`);
        this.counters[name] = 0;
    }
    clear() {
        Array.from(document.getElementById("history").children).forEach(elem => elem.remove());
    }
    debug(message) {
        this.log(message);
    }
    dir(obj) {
        this.log(obj);
    }
    dirxml(obj) {
        this.dir(obj);
    }
    error(obj) {
        if (obj instanceof Object) {
            this.isWaiting = true;
            this.output = Object.assign(document.createElement("output"), {
                className: "error",
            });
            this.output.appendChild(this.generatePropTree(obj));
        } else {
            this.isWaiting = true;
            this.output = Object.assign(document.createElement("output"), {
                value: obj,
                className: "error",
            });
        }
    }
    group(name) {
        this.log(`@Begin ${name}`);
    }
    groupCollapsed() {
        // <details> elem
        // above and below are temporary implementation
        // will have to rework stdout system to make groups work
    }
    groupEnd() {
        this.log(`@End ${name}`);
    }
    info(message) {
        this.log(message);
    }
    profile() {
        this._console.profile();
    }
    profileEnd() {
        this._console.profileEnd();
    }
    table(obj, columns) {
        const table = this.generateTable(obj, columns);
        this.isWaiting = true;
        this.output = Object.assign(document.createElement("output"), {
            className: "log",
        });
        this.output.appendChild(table);
    }
    generateTable(obj, columns = []) {
        const properties = new Set();
        for (const value of Object.values(obj)) {
            if (!(value instanceof Object)) continue;
            for (const k in value) {
                if (!~columns.indexOf(k) && columns.length > 0) continue;
                properties.add(k);
            }
        }

        const table = document.createElement("table");
        const header = document.createElement("tr");
        header.appendChild(
            Object.assign(document.createElement("th"), {
                scope: "column",
                textContent: "(index)",
            })
        );

        if (properties.size > 0) {
            properties.forEach((prop) => {
                header.appendChild(
                    Object.assign(document.createElement("th"), {
                        scope: "column",
                        textContent: prop,
                    })
                );
            });
        } else {
            header.appendChild(
                Object.assign(document.createElement("th"), {
                    scope: "column",
                    textContent: "Value",
                })
            );
        }

        table.appendChild(header);
        console._console.log(properties);
        for (const [key, value] of Object.entries(obj)) {
            const row = document.createElement("tr");
            row.appendChild(
                Object.assign(document.createElement("th"), {
                    scope: "row",
                    textContent: key,
                })
            );
            if (properties.size > 0) {
                properties.forEach(prop => {
                    if (prop in value) {
                        row.appendChild(Object.assign(document.createElement("td"), {
                            textContent: `${value[prop]}`,
                        }));
                    } else {
                        row.appendChild(Object.assign(document.createElement("td"), { textContent: "" }));
                    }
                });
            } else {
                console._console.log(value);
                row.appendChild(Object.assign(document.createElement("td"), { textContent: value }));
            }
            table.appendChild(row);
        }
        return table;
    }
    time(name = "default") {
        if (this.timers[name]) return this.warn(`Timer ${name} already exists`);
        this.timers[name] = Date.now();
    }
    timeEnd(name = "default") {
        if (!this.timers[name]) return this.warn(`Timer ${name} does not exist`);
        this.log(`${name}: ${(Date.now() - this.timers[name]) / 1000} ms`);
        delete this.timers[name];
    }
    timeLog(name = "default") {
        if (!this.timers[name]) return this.warn(`Timer ${name} does not exist`);
        this.log(`${name}: ${(Date.now() - this.timers[name]) / 1000} ms`);
    }
    timeStamp() {
        this._console.timeStamp();
    }
    trace() {
        this._console.trace();
    }
    warn(obj) {
        if (obj instanceof Object) {
            this.isWaiting = true;
            this.output = Object.assign(document.createElement("output"), {
                className: "warn",
            });
            this.output.appendChild(this.generatePropTree(obj));
        } else {
            this.isWaiting = true;
            this.output = Object.assign(document.createElement("output"), {
                value: obj,
                className: "warn",
            });
        }
    }
    assert(cond) {
        if (cond) return;
        this.error("Assertion failed: console.assert");
    }
}
