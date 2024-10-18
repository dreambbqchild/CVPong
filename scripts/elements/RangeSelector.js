export default class RangeSelector extends HTMLElement {
    #label;
    #min;
    #max;
    #ranges;

    get max() {
        return parseInt(this.getAttribute('max') || this.#min.max);
    }

    set max(value) {
        this.setAttribute('max', value);
    }

    get label() {
        return this.getAttribute('label') || '';
    }

    set label(value) {
        this.setAttribute('label', value);
        this.#label.textContent = value;
    }

    get bounds() {
        return [parseInt(this.#min.value) / this.max, parseInt(this.#max.value) / this.max];
    }

    set bounds(value) {
        this.#min.value = value[0] * this.max;
        this.#max.value = value[1] * this.max;
    }

    connectedCallback() {
        this.innerHTML = `<span></span>:<input type="range"/><input type="range"/>`;

        this.#label = this.querySelector('span');
        this.#ranges = this.querySelectorAll('input');
        [this.#min, this.#max] = this.#ranges;

        this.#label.textContent = this.label;
        
        for(const [i, range] of this.#ranges.entries()) {
            range.min = 0;
            range.max = this.max;
            range.value = i === 0 ? 0 : this.max;

            range.addEventListener("change", () => {
                if(this.#min.valueAsNumber <= this.#max.valueAsNumber)
                    return;
                
                this.#min.valueAsNumber = this.#max.valueAsNumber;
            });
        }
    }
}

customElements.define("range-selector", RangeSelector);