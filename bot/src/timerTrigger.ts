import { AzureFunction, Context } from "@azure/functions";
import { ConversationBot } from "@microsoft/teamsfx";
import fetch from "node-fetch";
import { buildAdaptiveCard } from "./adaptiveCard";
import avalancheForecastCard from "./adaptiveCards/avalanche-forecast-card.json";

// Time trigger to send notification. You can change the schedule in ../timerNotifyTrigger/function.json
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

  const timeStamp = new Date().toDateString();
  const forecast = await getForecast();

  for (const target of await ConversationBot.installations()) {
    await target.sendAdaptiveCard(
      buildAdaptiveCard(() => {
        console.log(forecast);
        return {
          danger: `Forecast for ${timeStamp} is rated ${forecast.Danger}`,
          rose: forecast.Rose
        };
      }, avalancheForecastCard)
    );
  }
};

function getForecast(): Promise<Forecast> {
  var url = 'https://avalancheforecastapp.azurewebsites.net/api/AvalancheForecastFunction?code=imq/71/iVgkXnkbcZ9uAOi/0zWgdV5oOZ2NDWvIXjhG2w50djMttKg==';
  return fetch(url)
    .then(response => response.json())
    .then(response => {
      return response as Forecast
    })
}

interface Forecast {
  Danger: string
  Rose: string
}

export default timerTrigger;