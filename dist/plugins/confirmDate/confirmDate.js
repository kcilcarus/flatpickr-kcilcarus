function confirmDatePlugin(pluginConfig) {
	return function (fp) {

		return {
			onReady: function onReady() {
				if (fp.calendarContainer === undefined) return;
				fp.innerContainer.insertBefore(buildradioes(fp), fp.innerContainer.childNodes[0]);
			},
			onChange: highlightWeek,
		};
	};
}

function buildradioes(fp) {
	const header = fp._createElement("span", "flatpickr-radio-all");
	header.appendChild(buildradio(fp, 0));

	fp.calendarContainer.classList.add("hasradio");
	fp.radioWrapper = fp._createElement("div", "flatpickr-radiowrapper");
	fp.radioWrapper.appendChild(header);
	fp.radioNumbers = fp._createElement("div", "flatpickr-radioes");

	for (var i = 1; i < 7; i++) {
		fp.radioWrapper.appendChild(buildradio(fp, i));
	}

	return fp.radioWrapper;
}

function buildradio(fp, index) {
	const cb = fp._createElement("input", "flatpickr-radio");
	cb.setAttribute("type","radio");
	cb.setAttribute("name","flatpickr-radio");
	cb.index = index
	cb.addEventListener("click", function (e){
		fp.weekStartDay = fp.days.childNodes[7*(cb.index-1)].dateObj;
		fp.weekEndDay = fp.days.childNodes[7*(cb.index-1)+6].dateObj;

		var days = fp.days.childNodes;
		for (var i = days.length; i--;) {
			days[i].classList.remove("week", "selected");
		}
		for (var i = days.length; i--;) {
			var date = days[i].dateObj;
			if (date >= fp.weekStartDay && date <= fp.weekEndDay) days[i].classList.add("week", "selected");
		}
	})
	return cb
}

function highlightWeek() {
	if (fp.radioWrapper) {
		fp.weekStartDay = fp.days.childNodes[7 * Math.floor(fp.selectedDateElem.$i / 7)].dateObj;
		fp.weekEndDay = fp.days.childNodes[7 * Math.ceil(fp.selectedDateElem.$i / 7 + 0.01) - 1].dateObj;
	}
	var days = fp.days.childNodes;
	for (var i = days.length; i--;) {
		var date = days[i].dateObj;
		if (date >= fp.weekStartDay && date <= fp.weekEndDay) days[i].classList.add("week", "selected");
	}
}


if (typeof module !== "undefined") module.exports = confirmDatePlugin;