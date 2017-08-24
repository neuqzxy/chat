/**
 * Created by zhouxinyu on 2017/8/24.
 */
define(function (require, exports, module) {
    const socket = io.connect('http://localhost:3000/group1');
    module.exports = socket;
});