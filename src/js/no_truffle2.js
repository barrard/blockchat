App2={

  private_message_watcher:'',
  private_message_count:0,

initApp2:function(){
  App2.watch_for_private_messages()
},

  watch_for_private_messages:function(){
    App.private_message_watcher = setInterval(function(){
      App.contracts.BlockChat.get_private_message_count.call( {from:App.account}, function(e, _message_count){
        if(e){return e}
        var _count = _message_count.toNumber()
        console.log(_count)
        if(_count !== App2.private_message_count){
          // App.handle_animation('private_messages_count', 'pulse')
          App2.private_message_count = _count
          App.handle_animation('private_messages_count', 'pulse')
          App.get_private_message_by_index(_count-1)

        }else{

        }
        $('#private_messages_count').text(_count)
      })

    }, 4000)
  },
  append_private_message_to_list:function(_msg){
    console.log(_msg)
    let _time = _msg[1].toNumber()*1000
    let _from = App2.convert_address_to_name(_msg[0])
    let _message = _msg[2]
    let time_stamp = App2.format_date_time_stamp(_time)
    $('#my_private_messages').append(`
      <li class="small-font">${time_stamp} - ${_from} - ${_message}</li>
    `)

  },
  convert_address_to_name:function(_addr){
    let _name = App.users[_addr] || _addr
    return _name

  },
  format_date_time_stamp:function(_num){
    let date = new Date(_num)
    let seconds = date.getSeconds()
    let minutes = date.getMinutes()
    let hours = date.getHours()
    let day = date.getDate()
    let month = date.getMonth()+1
    let year = date.getFullYear()

    let _time_stamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    return _time_stamp
  }

}

$(function() {
  $(window).on('load', function() {
    console.log('load')
    App2.initApp2();
  });
});
