var MockScriptStore = function(){
        this.data = {};
};

MockScriptStore.prototype.get = function(key,cb){
        cb(null,(this.data && this.data[key] || null));
};

MockScriptStore.prototype.set = function(key,value,cb){
        this.data[key] = value;
        cb();
};

MockScriptStore.prototype.del = function(key,cb){
        delete this.data[key];
        cb();
};

module.exports = MockScriptStore;