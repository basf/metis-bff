/**
 * @apiDefine SSEStreamResponse response in a separate server-side event stream.
 * The stream objects may be of five types:
 * datasources, calculations, collections, filters, and errors.
 * They are concerned with their callers.
 *
 * @apiSuccessExample separate HTTP connection
 * Content-Type: text/event-stream
 *     [{...}, ...]
 */

module.exports = {
    head,
};

/**
 * @api {head} /v0 Pingpong
 * @apiName Ping
 * @apiGroup Ping
 * @apiPermission unprotected
 * @apiSuccess (202) reqId response sent to a separate server-side event stream.
 * @apiUse SSEStreamResponse
 */
async function head(req, res) {
    res.sse.sendTo('pong');
    return res.status(204).end();
}
