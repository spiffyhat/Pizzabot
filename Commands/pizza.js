module.exports = {
	name: 'pizza',
	description: 'This is test for taking pizza requests.',
	execute(message, args) {

		var beginning = 'I\'m still in beta, so pretend this is a picture of delicious ';

		var uniqueToppings = args.reduce(function (a, b) {
			if (a.indexOf(b) < 0) a.push(b);
			return a;
		}, []);

		if (uniqueToppings.length == 1 && !(uniqueToppings[0] == null)) {

			var raisins = false;
			var pineapple = false;

			if (uniqueToppings[0].toString() == 'raisins' || uniqueToppings[0].toString() == 'raisin') raisins = true;

			if (uniqueToppings[0].toString() == 'pineapple' || uniqueToppings[0].toString() == 'pineapples') pineapple = true;

			if (pineapple) beginning = ':warning: CONTROVERSIAL :warning: ' + beginning;

			if (raisins) {
				message.channel.send('There\'s no way I\'m going to make a pizza with raisins on it. Go to hell, ' + message.author.username.toString() + '.');
			} else {
				message.channel.send(beginning + uniqueToppings[0] + ' pizza :pizza:. ' + 'Bone appletea, ' + message.author.username.toString() + '!');
			}

			

		} else if (uniqueToppings.length > 10) {

			message.channel.send('That\'s WAY too many toppings ' + message.author.username.toString() + '! Try 10 or less, you absolute maniac.');

		} else if (uniqueToppings.length > 1) {

			var toppingsString = '';
			var needsComma = false;
			var raisins = false;
			var pineapple = false;
			var toppingCount = 0;

			for (const topping of uniqueToppings) {

				toppingCount++;

				if (topping.toString() == 'raisins' || topping == 'raisin') raisins = true;

				if (topping.toString() == 'pineapple' || topping == 'pineapples') pineapple = true;

				if (!(topping.toString() == 'and' || topping.toString() == '&')) {

					if (toppingCount == uniqueToppings.length && uniqueToppings.length > 1) {
						toppingsString += ' and ';
						toppingsString += topping;
					} else {
						if (needsComma) toppingsString += ', ';
						toppingsString += topping;
						needsComma = true;
					}

				}

			}

			if (pineapple) beginning = ':warning: CONTROVERSIAL :warning: ' + beginning;

			if (raisins) {
				message.channel.send('There\'s no way I\'m going to make a pizza with raisins on it. Go to hell, ' + message.author.username.toString() + '.');
			} else {
				message.channel.send(beginning + toppingsString + ' pizza :pizza:. ' + 'Bone appletea, ' + message.author.username.toString() + '!');
			}
			
		} else {

			message.channel.send(beginning + 'pizza :pizza:. ' + 'Bone appletea, ' + message.author.username.toString() + '!');

		}		
	}
}