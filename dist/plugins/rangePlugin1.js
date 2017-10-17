window.s_day = undefined;
window.e_day = undefined;
function rangePlugin(config = {}) {
    return function (fp) {
        let dateFormat;

        const createSecondInput = () => {
            if (config.input) {
                fp.secondInput = config.input instanceof Element
                    ? config.input
                    : window.document.querySelector(config.input)
            }

            else {
                fp.secondInput = fp._input.cloneNode();
                fp.secondInput.removeAttribute("id");
                fp.secondInput._flatpickr = null;
            }

            fp.secondInput.setAttribute("data-fp-omit", "");

            fp._bind(fp.secondInput, ["focus", "click"], e => {
                fp.open(e, fp.secondInput);
                if (fp.selectedDates[1]) {
                    if (window.e_day) {
                        fp.selectedDates[1] = window.e_day;
                    }
                    fp.latestSelectedDateObj = fp.selectedDates[1];
                    fp._setHoursFromDate(fp.selectedDates[1]);
                    fp.jumpToDate(fp.selectedDates[1]);
                }

                [fp._firstInputFocused, fp._secondInputFocused] = [false, true];
            });

            fp._bind(fp.secondInput, "blur", e => {
                fp.isOpen = false
            });

            fp._bind(fp.secondInput, "keydown", e => {
                if (e.key === "Enter") {
                    fp.setDate([fp.selectedDates[0], fp.secondInput.value], true, dateFormat);
                    fp.secondInput.click();

                }
            });
            if (!config.input)
                fp._input.parentNode.insertBefore(fp.secondInput, fp._input.nextSibling);
        }

        function highlightWeek() {
            return;
            if (fp.selectedDateElem) {
                fp.weekStartDay = fp.days.childNodes[7 * Math.floor(fp.selectedDateElem.$i / 7)].dateObj;
                fp.weekEndDay = fp.days.childNodes[7 * Math.ceil(fp.selectedDateElem.$i / 7 + 0.01) - 1].dateObj;
            }
            var days = fp.days.childNodes;
            for (var i = days.length; i--;) {
                var date = days[i].dateObj;
                if (date >= fp.weekStartDay && date <= fp.weekEndDay) days[i].classList.add("week", "selected");
            }
        }

        function onDayHover(event) {
            if (!event.target.classList.contains("flatpickr-day")) return;

            var days = event.target.parentNode.childNodes;
            var dayIndex = event.target.$i;

            var dayIndSeven = dayIndex / 7;
            var weekStartDay = days[7 * Math.floor(dayIndSeven)].dateObj;
            var weekEndDay = days[7 * Math.ceil(dayIndSeven + 0.01) - 1].dateObj;
            window.s_day = weekStartDay;
            window.e_day = weekEndDay;
            // for (var i = days.length; i--;) {
            // 	var date = days[i].dateObj;
            // 	if (date > weekEndDay || date < weekStartDay) {
            // 		if(this.selectedDates.length === 2){
            // 			days[i].classList.remove("inRange");
            // 		}
            // 	}else {
            // 		days[i].classList.add("inRange");
            // 	}
            // }
        }

        return {
            onParseConfig () {
                fp.config.mode = "range";
                fp.config.allowInput = true;
                dateFormat = fp.config.altInput ? fp.config.altFormat : fp.config.dateFormat;
            },

            onReady: [function () {
                createSecondInput();
                fp.config.ignoredFocusElements.push(fp.secondInput);
                fp._input.removeAttribute("readonly");
                fp.secondInput.removeAttribute("readonly");

                fp._bind(fp._input, "focus", e => {
                    if (window.s_day) {
                        fp.selectedDates[0] = window.s_day;
                    }

                    fp.latestSelectedDateObj = fp.selectedDates[0];
                    fp._setHoursFromDate(fp.selectedDates[0]);
                    [fp._firstInputFocused, fp._secondInputFocused] = [true, false];
                    fp.jumpToDate(fp.selectedDates[0]);
                });

                fp._bind(fp._input, "keydown", e => {
                    if (e.key === "Enter")
                        fp.setDate([fp._input.value, fp.selectedDates[1]], true, dateFormat);
                });

                fp.setDate(fp.selectedDates);

                fp.days.parentNode.addEventListener("mouseover", onDayHover.bind(fp));
            }, highlightWeek],

            onChange: [function () {
                if (!fp.selectedDates.length) {
                    setTimeout(() => {
                        if (fp.selectedDates.length)
                            return;

                        fp.secondInput.value = "";
                        fp._prevDates = [];
                    }, 10)
                }

            }, highlightWeek],

            onDestroy () {
                if (!config.input)
                    fp.secondInput.parentNode.removeChild(fp.secondInput);
                delete fp._prevDates;
                delete fp._firstInputFocused;
                delete fp._secondInputFocused;
            },

            onValueUpdate (selDates, dateStr) {
                if (!fp.secondInput)
                    return;

                fp._prevDates = !fp._prevDates || (selDates.length >= fp._prevDates.length)
                    ? selDates.map(d => d) // copy
                    : fp._prevDates;

                if (fp._prevDates.length > selDates.length) {
                    let newSelectedDate = selDates[0];

                    if (fp._firstInputFocused) {
                        if (window.s_day) {
                            newSelectedDate = window.s_day;
                        }
                        fp.setDate([newSelectedDate, fp._prevDates[1]]);
                    }

                    else if (fp._secondInputFocused) {
                        if (window.e_day) {
                            newSelectedDate = window.e_day;
                        }
                        fp.setDate([fp._prevDates[0], newSelectedDate]);
                    }
                }

                [fp._input.value = "", fp.secondInput.value = ""] = fp.selectedDates.map(
                    d => fp.formatDate(d, dateFormat)
                );
            }
        }
    }
}

if (typeof module !== "undefined")
    module.exports = rangePlugin;