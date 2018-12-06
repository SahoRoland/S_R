const http = require('http');
const port = 1234;
const cpu = require('os').cpus().length;

const useragent = require('useragent');
const ip = require('request-ip');

const cluster = require('cluster');
const uuidv1 = require('uuid/v1');



if (cluster.isMaster) {
    var uuid;
    for (let i = 0; i < cpu; i++) {
        uuid = uuidv1();
        cluster.fork({ workerId: uuid });
    }

    cluster.on('disconnect', function() {
        uuid = uuidv1();
        cluster.fork({ workerId: uuid });
    });

} else {
    const szerver = http.createServer((req, res) => {

        var ua = useragent.parse(req.headers['user-agent']);
        ua = ua.toString();

        var Ip = ip.getClientIp(req);

        var resp = {
              ua: ua,
              ip: Ip,
              uuid: process.env.WorkerId
        };

        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'user_agent': ua,
            'user_ip': Ip,
            'worker_uuid': process.env.WorkerId
        });

        res.end(JSON.stringify(resp));

    })
    szerver.listen(port, () => {
        //console.log(`worker${cluster.worker.id} uuid: ${process.env.WorkerId}`);
    })

}
