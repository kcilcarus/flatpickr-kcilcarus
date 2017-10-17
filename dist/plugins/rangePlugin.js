function rangePlugin(config = {}) {
	return function(fp) {
		let dateFormat;

		function highlightWeek() {
			debugger
			if (fp.selectedDateElem) {
				fp.weekStartDay = fp.days.childNodes[7 * Math.floor(fp.selectedDateElem.$i / 7)].dateObj;
				fp.weekEndDay = fp.days.childNodes[7 * Math.ceil(fp.selectedDateElem.$i / 7 + 0.01) - 1].dateObj;
			}
			var days = fp.days.childNodes;
			for (var i = days.length; i--;) {
				var date = days[i].dateObj;
				// if (date >= fp.weekStartDay && date <= fp.weekEndDay) days[i].classList.add("week", "selected");
				days[i].classList.remove("week", "selected");
				if (date == fp.weekStartDay) days[i].classList.add("week", "selected");
			}
		}

		function onDayHover(event) {
			if (!event.target.classList.contains("flatpickr-day")) return;
			fp.count =  fp.count ? fp.count : 1
			if(fp.count === 2 && event.target.dateObj < fp.selectedDates[0]) return;
			var days = event.target.parentNode.childNodes;
			var dayIndex = event.target.$i;
			
			var dayIndSeven = dayIndex / 7;
			var weekStartDay = days[7 * Math.floor(dayIndSeven)].dateObj;
			var weekEndDay = days[7 * Math.ceil(dayIndSeven + 0.01) - 1].dateObj;
			if(weekEndDay > new Date()) return;

			for (var i = days.length; i--;) {
				var date = days[i].dateObj;
				if (date > weekEndDay || date < weekStartDay) {
						days[i].classList.remove("weekSelected");
				}else {
					days[i].classList.add("weekSelected");
				}
				if(fp.count === 2){
					days[i].classList.remove("endRange");
					if(date === weekEndDay) {
						days[i].classList.add("endRange");
					}
				}
			}
		}

		return {
			onClose() {
				if(fp.count === 2) {
					fp.count = 1
				}
			},
			onParseConfig () {
				fp.config.mode = "range";
				fp.config.allowInput = true;
				dateFormat = fp.config.altInput ? fp.config.altFormat : fp.config.dateFormat;
			},

			onReady: [function(){
				fp._input.removeAttribute("readonly");

				fp._bind(fp._input, "keydown", e => {
					if (e.key === "Enter")
						fp.setDate([fp._input.value, fp.selectedDates[1]], true, dateFormat);
				});

				fp.setDate(fp.selectedDates);

				fp.days.parentNode.addEventListener("mouseover", onDayHover.bind(fp));
			}],

			onChange: [function() {
				if (fp.selectedDateElem) {
					fp.weekStartDay = fp.days.childNodes[7 * Math.floor(fp.selectedDateElem.$i / 7)].dateObj;
					fp.weekEndDay = fp.days.childNodes[7 * Math.ceil(fp.selectedDateElem.$i / 7 + 0.01) - 1].dateObj;
					fp.count = fp.count ? fp.count : 1
					if(fp.count === 1) {
						fp.selectedDates[0] = fp.weekStartDay
						//　Ｎote: 第一次选中后，禁用上方的ｄａｙ
						var days = fp.days.childNodes;
			
						for (var i = days.length; i--;) {
							var date = days[i].dateObj;
							if (date < fp.selectedDates[0]) {
									days[i].classList.add("aaaaaaaaaa");
							}
						}
					}
					if(fp.count === 2) fp.selectedDates[1] = fp.weekEndDay;	fp.setDate(fp.selectedDates);
					fp.count === 1 ? fp.count = 2 : fp.count = 1
				}

				if (!fp.selectedDates.length) {
					setTimeout(() => {
						if (fp.selectedDates.length)
							return;

						fp._prevDates = [];
					}, 10)
				}
				
			}],

			onDestroy () {
				delete fp._prevDates;
				delete fp._firstInputFocused;
			},

			onValueUpdate (selDates, dateStr) {
				if (!fp.secondInput)
					return;

				fp._prevDates = !fp._prevDates || (selDates.length >= fp._prevDates.length)
					? selDates.map(d => d) // copy
					: fp._prevDates;

				if (fp._prevDates.length > selDates.length) {
					const newSelectedDate = selDates[0];

					if (fp._firstInputFocused)
						fp.setDate([newSelectedDate, fp._prevDates[1]]);
				}

				[fp._input.value = ""] = fp.selectedDates.map(
					d => fp.formatDate(d, dateFormat)
				);
			}
		}
	}
}

if (typeof module !== "undefined")
	module.exports = rangePlugin;