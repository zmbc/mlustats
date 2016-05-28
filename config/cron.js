module.exports.cron = {
	scrape: {
		schedule: '0 0 0 * * 1-5/2',
		onTick: function() { ScraperService.scrapeCurrentWeek() }
	}
};
