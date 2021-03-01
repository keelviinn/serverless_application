import createError from 'http-errors';
import validator from '@middy/validator';
import dynamodb from '../database';
import commonMiddleware from '../lib/commonMIddleware';
import { getAuctionById } from './getAuction';
import placeBidSchema from '../schemas/placeBid.schema';

async function placeBid(event, context) {
  let updatedAuction;
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const auction = await getAuctionById(id);
  if (auction.status !== 'OPEN') 
    throw new createError.Forbidden(`You cannot bid on closed auctions - Auction Status: ${auction.status}`)
  if (amount <= auction.highestBid.amount) 
    throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}`)
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id }, 
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: { ':amount': amount },
    ReturnValues: 'ALL_NEW'
  }
  try {
    const result = await dynamodb.update(params).promise()
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error)
    throw new createError.InternalServerError(error);
  }  

  return {
    statusCode: 201,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid)
  .use(validator({ inputSchema: placeBidSchema }));


