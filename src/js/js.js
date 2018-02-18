toastr.options.progressBar = true;

App = {
  web3Provider: null,
  contracts: {},
  account:'',
  room_list:[],
  current_room:'one',
  username:'',

  init: function() {

    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
    web3.eth.getAccounts(function(e, r){
        console.log(r)
        $('#ethAccountID').html(r[0])
        App.account = r[0];
        web3.eth.getBalance(r[0].toString(),function(e, r){
          console.log(e)
          console.log(r.toNumber())
          $('#currentBalance').html(web3.fromWei(r.toNumber()))
          return App.initContract();

        })
      })

  },

  initContract: function() {
    $.getJSON('BlockChat.json', function(data) {
    // $.getJSON('TimeClock.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      App.contracts.BlockChat = TruffleContract(data);
      // Set the provider for our contract
      App.contracts.BlockChat.setProvider(App.web3Provider);
      // Use our contract to retrieve and mark the adopted pets
      App.list_all_rooms()
      App.get_username(App.account)

      console.log('this is working!!!!')
    });
    return App.set_UI();
    
  },
  get_username:function(_addr){ 
    console.log(_addr)
    App.contracts.BlockChat.deployed().then(function(inst){
      return inst.get_username.call(_addr, {from:App.account});
    }).then(function(_username){
      console.log(_username)
      App.username = _username
      $('#user_name').text(_username)
    }).catch(function(e){
      console.log('error.....')
      console.log(e)
    })

  },
  set_username:function(_name){
    App.contracts.BlockChat.deployed().then(function(inst){
      return inst.add_name(_name, {from:App.account, gas: "2000000", gasPrice:"2000000000"});
    }).then(function(name_added){
      App.username = _name
      console.log(name_added)
    }).catch(function(e){
      console.log('error.....')
      console.log(e)
    })
  },
  list_all_rooms:function(){
    console.log('lisitng rooms')
    App.contracts.BlockChat.deployed().then(function(instance){
      return instance.get_room_count.call({from: App.account})
    }).then(function(_room_count){
      var room_count = _room_count.toNumber()
      console.log('Room count :'+ room_count)
      toastr.success('Room Count '+room_count)
      for(let x = 0 ; x < room_count; x++){
        App.get_room_by_index(x, function(result){
          console.log(result)
          App.room_list.push(result)
          App.append_room_to_list(result)
        })

      }
    }).catch(function(e){
      toastr.error(e, 'Failed to get all employees')
      console.log('error.....')
      console.log(e)
    })
  },
  get_room_by_index:function(_index, callback){
    App.contracts.BlockChat.deployed().then(function(inst){
      return inst.get_room_by_index.call(_index);
    }).then(function(_room){
      callback(_room)
    })
  },
  append_room_to_list:function(_room, _sender){
    var rooms_list = $('#rooms_list')
    rooms_list.append(
      `<li data-sender="${_sender}"onclick=App.set_room("${_room}")>${_room}</li>`
      )

  },
  set_room:function(_room){
    console.log(_room)
    App.current_room = _room
    $('#current_room').text(_room)
    App.get_chats_for_room(_room)
  },
  get_chats_for_room:function(_room){
    App.contracts.BlockChat.deployed().then(function(inst){
      return inst.get_chat_room_chat_count.call(_room)
    }).then(function(_chat_count){
      console.log(_chat_count)
    })
  },
  get_message_for_room:function(_room, _index){
    console.log('lisitng rooms')
    App.contracts.BlockChat.deployed().then(function(instance){
      console.log(instance)
      return instance.get_message_for_room.call(_room, _index,{from: App.account})
    }).then(function(_message){
      console.log(_message)
    }).catch(function(e){
      console.log('error.....')
      console.log(e)
    })
    console.log('end of get all rooms')
  },
  add_new_chatroom:function(_new_chatroom_name){
    App.contracts.BlockChat.deployed().then(function(instance){
      return instance.add_new_chatroom(_new_chatroom_name, {from:App.account, gas: "2000000", gasPrice:"2000000000"})
      }).then(function(data){
        console.log(data)
        var logs = data.logs[0].args
        var _sender = logs._addr
        var _room = logs._room
        App.append_room_to_list(_room, _sender)

      }).catch(function(e){
        console.log(e)
      })
    },

    add_message:function(_room, _message){
      App.contracts.BlockChat.deployed().then(function(instance){
        return instance.add_message(_room, _message, {from:App.account, gas: "2000000", gasPrice:"2000000000"})
        }).then(function(data){
          console.log(data)
        }).catch(function(e){
          console.log(e)
        })
      },
      set_UI:function(){
        var make_new_room_btn = $('#make_new_room_btn');
        var new_room_name_input = $('#new_room_name_input');
        var rooms_list = $('#rooms_list');
        var send_chat_btn = $('#send_chat_btn');
        var chat_input = $('#chat_input');
        var set_username_btn= $('#set_username_btn');
        var username_input = $('#username_input');

        make_new_room_btn.on('click', function(){
          console.log(new_room_name_input.val())
          App.add_new_chatroom(new_room_name_input.val())
        })
        send_chat_btn.on('click', function(){
          console.log(chat_input.val())
          App.add_message(App.current_room, chat_input.val())
        })
        set_username_btn.on('click', function(){
          console.log(username_input.val())
          App.set_username(username_input.val())
        })


      }
  
}


$(function() {
  $(window).on('load', function() {
    console.log('load')
    App.init();
  });
});
