'use strict';

const {
	dialogflow,
	Permission,
	Suggestions,
	BasicCard,
	Carousel,
	Image,
	} = require('actions-on-google');

const functions = require('firebase-functions');

const app = dialogflow({debug: true});

app.intent('favorite color', (conv, {color}) => {
  const luckyNumber = color.length;
  const audioSound = 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg';
  if (conv.user.storage.userName) {
    conv.ask(`<speak>${conv.data.userName}, your lucky number is ` +
      `${luckyNumber}.<audio src="${audioSound}"></audio> ` +
      `Would you like to hear some fake colors?</speak>`);
    conv.ask(new Suggestions('Yes', 'No'));
  } else {
    conv.ask(`<speak>Your lucky number is ${luckyNumber}.` +
      `<audio src="${audioSound}"></audio> ` +
      `Would you like to hear some fake colors?</speak>`);
    conv.ask(new Suggestions('Yes', 'No'));
  }
});

app.intent('Default Welcome Intent', (conv) => {
 const name = conv.user.storage.userName;
 if (!name) {
   conv.ask(new Permission({
     context: 'Hi there, to get to know you better',
     permissions: 'NAME',
   }));
 } else {
   conv.ask(`Hi again, ${name}. What's your favorite color?`);
 }
});

app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    conv.ask(`Ok, no worries. What's your favorite color?`);
    conv.ask(new Suggestions('Blue', 'Red', 'Green'));
  } else {
    conv.user.storage.userName = conv.user.name.display;
    conv.ask(`Thanks, ${conv.data.userName}. What's your favorite color?`);
    conv.ask(new Suggestions('Blue', 'Red', 'Green'));
  }
});

const colorMap = {
  'indigo taco': {
    title: 'Indigo Taco',
    text: 'Indigo Taco is a subtle bluish tone.',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDN1JRbF9ZMHZsa1k/style-color-uiapplication-palette1.png',
      accessibilityText: 'Indigo Taco Color',
    },
    display: 'WHITE',
  },
  'pink unicorn': {
    title: 'Pink Unicorn',
    text: 'Pink Unicorn is an imaginative reddish hue.',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDbFVfTXpoaEE5Vzg/style-color-uiapplication-palette2.png',
      accessibilityText: 'Pink Unicorn Color',
    },
    display: 'WHITE',
  },
  'blue grey coffee': {
    title: 'Blue Grey Coffee',
    text: 'Calling out to rainy days, Blue Grey Coffee brings to mind your favorite coffee shop.',
    image: {
      url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDZUdpeURtaTUwLUk/style-color-colorsystem-gray-secondary-161116.png',
      accessibilityText: 'Blue Grey Coffee Color',
    },
    display: 'WHITE',
  },
};

app.intent('favorite fake color', (conv, {fakeColor}) => {
  fakeColor = conv.arguments.get('OPTION') || fakeColor;
  if (!conv.screen) {
    conv.ask(colorMap[fakeColor].text);
  } else {
    conv.ask(`Here you go.`, new BasicCard(colorMap[fakeColor]));
  }
  conv.ask('Do you want to hear about another fake color?');
  conv.ask(new Suggestions('Yes', 'No'));
});

app.intent('actions_intent_NO_INPUT', (conv) => {
  const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
  if (repromptCount === 0) {
    conv.ask('Which color would you like to hear about?');
  } else if (repromptCount === 1) {
    conv.ask(`Please say the name of a color.`);
  } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
    conv.close(`Sorry we're having trouble. Let's ` +
      `try this again later. Goodbye.`);
  }
});

const fakeColorCarousel = () => {
  const carousel = new Carousel({
   items: {
     'indigo taco': {
       title: 'Indigo Taco',
       synonyms: ['indigo', 'taco'],
       image: new Image({
         url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDN1JRbF9ZMHZsa1k/style-color-uiapplication-palette1.png',
         alt: 'Indigo Taco Color',
       }),
     },
     'pink unicorn': {
       title: 'Pink Unicorn',
       synonyms: ['pink', 'unicorn'],
       image: new Image({
         url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDbFVfTXpoaEE5Vzg/style-color-uiapplication-palette2.png',
         alt: 'Pink Unicorn Color',
       }),
     },
     'blue grey coffee': {
       title: 'Blue Grey Coffee',
       synonyms: ['blue', 'grey', 'coffee'],
       image: new Image({
         url: 'https://storage.googleapis.com/material-design/publish/material_v_12/assets/0BxFyKV4eeNjDZUdpeURtaTUwLUk/style-color-colorsystem-gray-secondary-161116.png',
         alt: 'Blue Grey Coffee Color',
       }),
     },
 }});
 return carousel;
};

app.intent(['favorite color - yes', 'favorite fake color - yes'], (conv) => {
 conv.ask('Which color, indigo taco, pink unicorn or blue grey coffee?');
 if (conv.screen) return conv.ask(fakeColorCarousel());
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
