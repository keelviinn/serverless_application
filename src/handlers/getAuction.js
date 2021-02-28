import dynamodb from '../database';
import createError from 'http-errors';
import commonMiddleware from '../lib/commonMIddleware';
export async function getAuctionById(id) {
  let auction;

  try {
    const result = await dynamodb.get({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Key: { id }
    }).promise();
    auction = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  if (!auction) throw new createError.NotFound(`Auction with ID "${id}" not found!`);

  return auction
}

async function getAuction(event, context) {  
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);


