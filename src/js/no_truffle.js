toastr.options.progressBar = true;
console.log('hello')

App = {
  web3Provider: null,
  contracts: {},
  address:{
    BlockChat:"0xb9c94405f99d271aac1f86ae882cd79c08c555ee"
  },
  abi:{},
  account:'',
  room_list:[],
  current_room:'one',
  username:'',
  users:{},
  current_block_event:0,

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
      App.abi.BlockChat = web3.eth.contract(data)
      App.contracts.BlockChat = App.abi.BlockChat.at(App.address.BlockChat)


      App.list_all_rooms()
      App.get_username(App.account)

      console.log('this is working!!!!')
      return App.set_UI();
    });
    
    
  },
  get_username:function(_addr){ 
    // console.log(_addr.toString())
    // console.log(App.account)
    App.contracts.BlockChat.get_username.call(_addr, {from:App.account}, function(e, _username){
      if(!e){
        console.log(_username)
        App.username = _username
        $('#user_name').text(_username)
      }else{
        console.log('error.....')
        console.log(e)
      }
    })

  },
  set_username:function(_name){
    App.contracts.BlockChat.add_name(_name, {from:App.account, gas: "2000000", gasPrice:"2000000000"}, function(e, name_added){
      if(!e){
        App.username = _name
        console.log(name_added)
        $('#user_name').text(_name)
      }else{
        console.log('error.....')
        console.log(e)
      }
    })
  },
  list_all_rooms:function(){
    // console.log('lisitng rooms')
    // App.contracts.BlockChat.get_room_count.call({from: App.account}, function(e, _room_count){
    //   if(!e){
    //     var room_count = _room_count.toNumber()
    //     console.log('Room count :'+ room_count)
    //     toastr.success('Room Count '+room_count)
    //     for(let x = 0 ; x < room_count; x++){
    //       App.get_room_by_index(x, function(result){
    //         if(!result){
    //           console.log('error')
    //         }else{
    //           console.log(result)
    //           App.room_list.push(result)
    //           // App.append_room_to_list(result)
    //         }

    //       })
    //     }
    //   }else{
    //     toastr.error(e, 'Failed to get all employees')
    //     console.log('error.....')
    //     console.log(e)
    //   }
    // })
  },
  get_room_by_index:function(_index, callback){
    App.contracts.BlockChat.get_room_by_index.call(_index, function(e, _room){
      if(!e){
        callback(_room)
      }else{
        callback()

      }
    })
  },
  append_room_to_list:function(_room, _sender){
    console.log('APPENDING THE ROOM '+_room)
    var rooms_list = $('#rooms_list')
    rooms_list.append(
      `<li data-sender='${_sender}' onclick="App.set_room('${_room}')">${_room}</li>`
      )

  },
  append_user_to_user_list:function(_name, _addr, isNew){
    if(isNew === "new"){
      var user_list = $('#user_list')
      user_list.append(
        `<li data-addr="${_addr}" onclick=App.get_user_info("${_name}")>${_name} - <span class="small-font">${_addr}</span></li>`
        )
    }else{
      $(`[data-addr="${_addr}"]`).html(`${_name} - <span class="small-font">${_addr}</span>`)

    }


  },
  set_room:function(_room){
    console.log(_room)
    App.current_room = _room
    $('#current_room').text(_room)
    App.get_chats_for_room(_room)
  },
  get_chats_for_room:function(_room){
    App.contracts.BlockChat.get_chat_room_chat_count.call(_room, function(e, _chat_count){
      if(!e){
        console.log(_chat_count)
      }else{
        console.log(e)
      }
    })
  },
  get_message_for_room:function(_room, _index){
    console.log('lisitng rooms')
    App.contracts.BlockChat.get_message_for_room.call(_room, _index,
      {from: App.account}, function(e, _message){
        if(!e){
          console.log(_message)

        }else{
          console.log('error.....')
          console.log(e)
        }
      })
    console.log('end of get all rooms')
  },
  append_message_to_chat_box:function(message_obj){
    console.log(message_obj)
    var m = message_obj
    var chat = `
    <p data-id="${m._id.toNumber()}"><span>${m._name}</span>: ${m._message}</p>
    `
    $('#chat_box').append(chat)
  },
  add_new_chatroom:function(_new_chatroom_name){
    App.contracts.BlockChat.add_new_chatroom(_new_chatroom_name,
      {from:App.account, gas: "2000000", gasPrice:"2000000000"}, function(e, data){
        if(!e){
          console.log(data)
          // var logs = data.logs[0].args
          // var _sender = logs._addr
          // var _room = logs._room
          // App.append_room_to_list(_room, _sender)
        }else{
          console.log(e)
        }
      })
    },

    add_message:function(_room, _message){
      App.contracts.BlockChat.add_message(_room, _message, {from:App.account, gas: "2000000", gasPrice:"2000000000"}, function(e, data){
          if(!e){

          }else{
            console.log(e)
          }
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
          var _safe_name = App.escapeHtml(username_input.val())

          App.add_new_chatroom(_safe_name)
          new_room_name_input.val('')
        })
        send_chat_btn.on('click', function(){
          console.log(chat_input.val())
          var _safe_name = App.escapeHtml(username_input.val())

          App.add_message(App.current_room, _safe_name)
          chat_input.val('')
        })
        set_username_btn.on('click', function(){
          console.log(username_input.val())
          var _safe_name = App.escapeHtml(username_input.val())
          App.set_username(_safe_name)
          username_input.val('')
        })

        return App.set_watchers()
      },
      set_watchers:function(){
        // event User_joined(string _name);
        // event New_chat_room_created(string _room, address _addr);
        // event New_chat_message(string _room, string _name, uint _id_index, string _message);
        var User_joined_event = App.contracts.BlockChat.User_joined(
          {}, {fromBlock:0, toBlock:'latest'})
        User_joined_event.watch(function(e, r){
            if(e){
              console.log('error')
              console.log(e)
            }else if (r){
              if(App.check_block(r)){
                console.log(r)
                var _name = r.args._name
                var _addr = r.args._addr
                console.log(App.users[_addr])
                if(App.users[_addr]){
                  console.log('got this already?')
                  App.append_user_to_user_list(_name, _addr, 'update')
                }else{
                  console.log('maybe this is  a new one?')
                  App.append_user_to_user_list(_name, _addr, 'new')

                }
                App.users[_addr] = _name
                // App.append_user_to_user_list(_name, _addr)
                // console.log(App.hex2a(r.args._name))
                console.log('User_joined_event')
              }else{
              }

            }else{
              console.log('User_joined_event error')
            }
          })
        var New_chat_room_created_event = App.contracts.BlockChat.New_chat_room_created(
          {}, {fromBlock:0, toBlock:'latest'})
        var x = 0
        New_chat_room_created_event.watch(function(e, r){
            if(e){
              console.log('error')
              console.log(e)
            }else if (r){
              if(App.check_block(r)){
                console.log(r)
                var _room = r.args._room
                var _addr = r.args._addr
                App.append_room_to_list(_room, _addr)

                console.log('New_chat_room_created_event')
              }else{
                console.log('preventing dups')

              }

            }else{
              console.log('New_chat_room_created_event error')
            }
          })

        var New_chat_message_event = App.contracts.BlockChat.New_chat_message(
          {}, {fromBlock:0, toBlock:'latest'})
        New_chat_message_event.watch(function(e, r){
            if(e){
              console.log('error')
              console.log(e)
            }else if (r){
              if(App.check_block(r)){
                console.log(r)
                var data = r
                console.log(data)
                var _id = data.args._id_index
                var _message = data.args._message
                var _name = data.args._name
                var _room = data.args._room
                App.append_message_to_chat_box({_id, _message, _name, _room})
                // console.log(App.hex2a(r.args._name))
                console.log('New_chat_message_event')
              }else{
                console.log('preventing dups')

              }

            }else{
              console.log('New_chat_message_event error')
            }
          })  
      },
      check_block:function(block){
        console.log(App.current_block_event === block.blockNumber)
        if(App.current_block_event === block.blockNumber){
          console.log('same')
          return false
        }else{
          App.current_block_event = block.blockNumber
          console.log('set to new block, this should run some coooode yeeaaahhhh')
          return true
        }
        console.log(App.current_block_event === block.blockNumber)
        console.log(block.blockNumber)
      },
      escapeHtml:function(_string){
        var entityMap = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '/': '&#x2F;',
          '`': '&#x60;',
          '=': '&#x3D;'
        };

        return String(_string).replace(/[&<>"'`=\/]/g, function (s) {
          return entityMap[s];
        });
      }
}


$(function() {
  $(window).on('load', function() {
    console.log('load')
    App.init();
  });
});
