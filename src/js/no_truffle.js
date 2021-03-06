toastr.options.progressBar = true;
App = {
  web3Provider: null,
  contracts: {},
  address:{
    // BlockChat:"0x9b77083f0fcee81e3c0f7c3ea421dff76fe07fbf"
    BlockChat:"0xdaAa3F77a70566ACA24380bf0189c03A792a488F"//Rinkeby
  },
  block_hash:[],
  abi:{},
  account:'',
  room_list:[],
  current_room:'',
  username:'',
  users:{},
  private_messages:[],

  init: function() {

    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://192.168.0.93:8545');
    }
    web3 = new Web3(App.web3Provider);
    web3.eth.getAccounts(function(e, r){
        console.log(r)
        $('#ethAccountID').html(r[0])
        App.account = r[0];
        web3.eth.getBalance(r[0].toString(),function(e, r){
          if(e){console.log(e)}
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
      App.get_username(App.account)//This calls the setUI function
      App.get_private_messages()
    });  
  },
  get_private_messages:function(){
    App.contracts.BlockChat.get_private_message_count.call( {from:App.account}, function(e, _message_count){
      console.log(e)
      var _msg_count = _message_count.toNumber();
      $('#private_messages_count').text(_msg_count);
      App2.private_message_count = _msg_count;
      for(let x = 0 ; x < _msg_count ; x++){
        App.contracts.BlockChat.get_private_message.call( x,   {from:App.account}, function(e, _msg){
          if(!e){
            console.log(_msg)
            App.private_messages.push(_msg)
            App2.append_private_message_to_list(_msg)
          }else{
              console.log('e'); console.log(e)
          }
        })

      }

    })
  },
  get_private_message_by_index:function(_index){
        App.contracts.BlockChat.get_private_message.call( _index,   {from:App.account}, function(e, _msg){
          if(!e){
            console.log(_msg)
            App.private_messages.push(_msg)
            App2.append_private_message_to_list(_msg)
          }else{
              console.log('e'); console.log(e)
          }
        })

      

  },
  send_private_message:function(_addr, _msg){
    console.log('send this')
    App.contracts.BlockChat.send_private_message(_addr, _msg ,
      {from:App.account, gas: "1530650", gasPrice:"200000000"}, function(e, _response){
      console.log(e)
      console.log(_response)
      App.call_when_mined(_response, function(){
        console.log("message has been delivered")
      })
    })
  },
  get_username:function(_addr){ 
    // console.log(App.account)
    App.contracts.BlockChat.get_username.call(_addr, {from:App.account}, function(e, _username){
      console.log(_addr)
      if(!e){
        console.log(_username)
        App.username = _username
        $('#user_name').text(_username)
      }else{
        console.log('error.....')
        console.log(e)
      }
      return App.set_UI();

    })

  },
  set_username:function(_name){
    App.contracts.BlockChat.add_name(_name, {from:App.account, gas: "2000000", gasPrice:"2000000000"}, function(e, name_added){
      if(!e){
        App.username = _name
        console.log(name_added)
        $('#user_name').text(_name)
        App.call_when_mined(name_added, function(){
          console.log("Username is set")
          $('#room_manager').removeClass('hidden')
          App.check_if_current_room_set();

        })
      }else{
        console.log('error.....')
        console.log(e)
      }
    })
  },
  list_all_rooms:function(){
    console.log('lisitng rooms')
    App.contracts.BlockChat.get_room_count.call({from: App.account}, function(e, _room_count){
      if(!e){
        var room_count = _room_count.toNumber()
        console.log('Room count :'+ room_count)
        toastr.success('Room Count '+room_count)
        for(let x = 0 ; x < room_count; x++){
          App.get_room_by_index(x, function(result){
            if(!result){
              console.log('error')
              
            }else{
              console.log(result)
              App.room_list.push(result)
              App.append_room_to_list(result[2], result[1], result[4])
            }

          })
        }
      }else{
        toastr.error(e, 'Failed to get all employees')
        console.log('error.....')
        console.log(e)
      }
    })
  },
  get_room_by_index:function(_index, callback){
    App.contracts.BlockChat.get_room_by_index.call(_index, {from:App.account},function(e, _room){
      if(!e && !_room){
        console.log('big err')
      }else if(_room){
        console.log('no err?')
        callback(_room)

      }
    })
  },
  append_room_to_list:function(_room, _sender, _public){
    console.log('APPENDING THE ROOM '+_room)
    var rooms_list = $('#rooms_list')
    var style = ``;
    _public ? style = "is_public_room" : style = "not_public_room"
    rooms_list.append(
      `<li class="${style}" data-sender='${_sender}' onclick="App.set_room('${_room}')">${_room}</li>`
      )

  },
  append_user_to_user_list:function(_name, _addr, isNew){
    if(isNew === "new"){
      var user_list = $('#user_list')
      var to_address_select = $('#to_address_select')
      user_list.append(
        `<li data-addr="${_addr}" onclick=App.get_user_info("${_name}")>${_name} - <span class="small-font">${_addr}</span></li>`
        )
      to_address_select.append(`
        <option data-option="${_addr}">${_name}</option>
        `)
    }else{
      $(`[data-addr="${_addr}"]`).html(`${_name} - <span class="small-font">${_addr}</span>`)
      $(`[data-option="${_addr}"]`).html(`${_name}`)

    }


  },
  set_room:function(_room){
    console.log(_room)
    App.current_room = _room
    $('#chat_box_container').removeClass('hidden')

    $('#current_room').text(_room)
    App.get_chats_for_room(_room)
    $('#chat_box').html('')
  },
  get_chats_for_room:function(_room){
    App.contracts.BlockChat.get_chat_room_chat_count.call(_room, function(e, _chat_count){
      if(!e){
        console.log(_chat_count)
        for(let x = 0 ; x < _chat_count;x++){
          App.get_message_for_room(_room, x)
        }
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
          //0:id, 1:name, 2:time, 3:message, 4:room
          _msg_obj = {
            _id:_message[0],
            _name:_message[1],
            _time:_message[2],
            _message:_message[3],
            _room:_message[4],
          }
          App.append_message_to_chat_box(_msg_obj)

        }else{
          console.log('error.....')
          console.log(e)
        }
      })
    console.log('end of get all rooms')
  },
  append_message_to_chat_box:function(message_obj){
    //this data could be storged instead of ignored...
    // console.log(message_obj)
    if(App.current_room !== message_obj._room) return
    console.log(message_obj)
    var m = message_obj
    var chat = `
    <p data-id="${m._id.toNumber()}">${m._time}<span>${m._name}</span>: ${m._message}</p>
    `
    $('#chat_box').append(chat)
  },
  add_new_chatroom:function(_new_chatroom_name, _is_public){
    console.log(_new_chatroom_name)
    console.log(_is_public)
    App.contracts.BlockChat.add_new_chatroom(_new_chatroom_name, _is_public,
      {from:App.account, gas: "924470", gasPrice:"4000000000"}, function(e, data){
        if(!e){
          console.log(data)
          // var logs = data.logs[0].args
          // var _sender = logs._addr
          // var _room = logs._room
          // App.append_room_to_list(_room, _sender)
          App.call_when_mined(data, function(){
            console.log('new chat room aded')
          })
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
    call_when_mined:function(txHash, callback){
      web3.eth.getTransactionReceipt(txHash, function(e, r){
        if(e){console.log(e)}
          else{
            if(r==null){
              setTimeout(function(){
                App.call_when_mined(txHash, callback)
              }, 500)
            }else{
              callback();
            }
          }
      })
    },
    check_if_username_set:function(){
      if(App.username === ''){
        toastr.info('please enter you username')
        App.handle_animation('username_input', 'bounce')
        App.handle_animation('set_username_btn', 'wobble')
      }else{
        $('#room_manager').toggle('hidden')
        toastr.info('Name set to '+App.username)
        App.check_if_current_room_set();
      }
    },
    check_if_current_room_set:function(){
      if(App.current_room === ''){
        App.handle_animation('rooms_available', 'bounce')
        App.handle_animation('make_new_room_btn', 'wobble')
        App.handle_animation('new_room_name_input', 'swing')
        App.handle_animation('room_manager', 'slineInLeft')
        toastr.info('please select a room')
        App.list_all_rooms()


      }else{
        $('#chat_box_container').toggle('hidden')
      }
    },
    set_UI:function(){
      var make_new_room_btn = $('#make_new_room_btn');
      var new_room_name_input = $('#new_room_name_input');
      var rooms_list = $('#rooms_list');
      var send_chat_btn = $('#send_chat_btn');
      var chat_input = $('#chat_input');
      var set_username_btn= $('#set_username_btn');
      var username_input = $('#username_input');
      var send_private_message_btn = $('#send_private_message_btn')
      var to_address_select = $('#to_address_select');

      //check for basic user info to be set
      App.check_if_username_set();



      //Event listener for Create New Room button
      make_new_room_btn.on('click', function(){
        console.log(new_room_name_input.val())
        var _safe_name = App.escapeHtml(new_room_name_input.val())
        var is_public = document.getElementById('room_is_public').checked
        App.add_new_chatroom(_safe_name, is_public)
        new_room_name_input.val('')
      })
      //Event listener for send chat to roombutton
      send_chat_btn.on('click', function(){
        console.log(chat_input.val())
        var _safe_name = App.escapeHtml(chat_input.val())
        App.add_message(App.current_room, _safe_name)
        chat_input.val('')
      })

      //Event listener for set new name button
      set_username_btn.on('click', function(){
        console.log(username_input.val())
        var _safe_name = App.escapeHtml(username_input.val())
        App.set_username(_safe_name)
        username_input.val('')
      })

      $('#open_private_message_box_btn').on('click', function(){
        //open private message box
        $('#private_message_box').toggle("hidden");

      })
      //Event listener for sending private messages
      send_private_message_btn.on('click', function(){
        if($('#private_message_text').val() == ''){ return false}
        if($('#to_address_private_message').text()==''){return false}
          console.log('send msg to')
          var _msg = $('#private_message_text').val()
          var _addr = $('#to_address_private_message').text()
          //Reset everything, change as needed... maybe add check box instead
          $('#private_message_text').val('')
          $('#to_address_private_message').text('')
          to_address_select.val('')

          App.send_private_message(_addr, _msg)
      })
      $('#close_private_message_box').on('click', function(){
        console.log('Clocse!!')
        $('#private_message_box').toggle("hidden");

      })

      //Event listener for selcting user to send private message
      to_address_select.on('change', function(e){
        if(e.target.value == ''){
          $('#to_address_private_message').text('')
        }else{
          var addr = $(this).find(':selected').data('option')
          //updateUI
          $('#to_address_private_message').text(addr)
          console.log(e.target.value)
            
        }
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
        console.log('User_joined_event')
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
            }else{
            }

          }else{
            console.log('User_joined_event error')
          }
        })
      var New_chat_room_created_event = App.contracts.BlockChat.New_chat_room_created(
        {}, {fromBlock:0, toBlock:'latest'})
      New_chat_room_created_event.watch(function(e, r){
        console.log('New_chat_room_created_event')
          if(e){
            console.log('error')
            console.log(e)
          }else if (r){
            if(App.check_block(r)){
              console.log(r)
              var _room = r.args._room
              var _addr = r.args._addr
              var _public = r.args._public
              App.append_room_to_list(_room, _addr, _public)

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
        console.log('New_chat_message_event')
          if(e){
            console.log('error')
            console.log(e)
          }else if (r){
            if(App.check_block(r.blockHash)){
              // console.log(r)
              var data = r
              console.log(data)
              var _id = data.args._id_index
              var _message = data.args._message
              var _name = data.args._name
              var _room = data.args._room
              var _time = data.args._time
              App.append_message_to_chat_box({_id, _message, _name, _time, _room})
              // console.log(App.hex2a(r.args._name))
            }else{
              console.log('preventing dups')

            }

          }else{
            console.log('New_chat_message_event error')
          }
        })  
      },
      check_block:function(_blockHash){
        if( App.block_hash.indexOf(_blockHash) === -1){
          App.block_hash.push(_blockHash)
          return true
        }else{
          return false
        }
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
      },
      handle_animation:function(_element, animation){
        var element = document.getElementById(_element)
        function remove_animation_class(){
          console.log('animation over')
          element.classList.remove('animated', animation)
          element.removeEventListener('animationend', remove_animation_class)
        }
        
        element.addEventListener('animationend', remove_animation_class)

        element.classList.add('animated', animation)
      }
}


$(function() {
  $(window).on('load', function() {
    console.log('load')
    App.init();
  });
});
