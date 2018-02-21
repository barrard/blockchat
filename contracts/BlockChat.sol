pragma solidity ^0.4.18;

contract BlockChat{
    uint room_count=0;
    Room_object[] room_array;
    Room_object _new_room;

    
    mapping (string=> mapping (uint=>Chat_object)) All_chats;
    mapping (address=>string) address_to_name;
    mapping (string=>uint) chats_per_room;
    mapping (address=>uint) address_to_private_mesage_count;
    mapping (address=>Private_massage_obect[]) address_to_private_mesages_array;

    event User_joined(address _addr, string _name);
    event New_chat_room_created(string _room, address _addr, bool _public);
    event New_chat_message(string _room, string _name, uint _id_index, string _message, uint _time);
    
    
    struct Private_massage_obect{
        uint _id;
        address _from;
        uint _time;
        string _message;
        bool _is_new;
    }
    
    struct Chat_object{
        uint _id;
        string _name;
        uint _time;
        string _message;
    }
    
    struct Room_object{
        uint _id;
        address _addr_of_creator;
        string _name;
        uint _date;
        bool _public;
        address[] _alowed_if_not_public;
    }
    
    function send_private_message(address _to, string _msg) public {
        Private_massage_obect memory _pmo;
        uint  _message_count = address_to_private_mesage_count[_to]; 
        _pmo._id = _message_count;
        _pmo._from = msg.sender;
        _pmo._time = now;
        _pmo._message = _msg;
        _pmo._is_new = true;
        address_to_private_mesages_array[_to].push(_pmo);
        address_to_private_mesage_count[_to]++;
    }
    
    function get_private_message_count() public view returns (uint){
        return address_to_private_mesage_count[msg.sender];
        
    }
    
    function get_private_message(uint _id) public view returns (address, uint, string){
        Private_massage_obect storage _pmo = address_to_private_mesages_array[msg.sender][_id];
        return (_pmo._from, _pmo._time, _pmo._message);
    }

    function get_room_count() constant public returns (uint){
        return room_count;
    }
    
    function add_new_chatroom(string _room, bool _public) public{
        require(chats_per_room[_room] < 1);
        chats_per_room[_room] = 0;
        Room_object storage _new_room;
        _new_room._id = room_count;
        _new_room._addr_of_creator = msg.sender;
        _new_room._name = _room;
        _new_room._date = now;
        _new_room._public = _public;
        room_array[room_count] = _new_room;
        room_count++;
        New_chat_room_created(_room, msg.sender, _public);
        
    }

    function get_room_by_index (uint _index) constant public returns(uint, address, string, uint, bool, address[]) {
        Room_object memory _ro = room_array[_index];
        return (_ro._id, _ro._addr_of_creator, _ro._name, _ro._date, _ro._public, _ro._alowed_if_not_public);        
    }
    
    function delete_room(uint _index) public view returns(bool){
        Room_object memory _ro = room_array[_index];
        address _owner = _ro._addr_of_creator;
        if(_owner == msg.sender){
            return true;
        }else{
            return false;    
        }
    }
    
    function get_chat_room_chat_count(string _chat_room) constant public returns (uint){
        return chats_per_room[_chat_room];
    }
    
    function add_name(string _name) public{
        address_to_name[msg.sender] = _name;
        User_joined(msg.sender, _name);
    }
    
    function get_username(address _addr) public view returns(string){
        return address_to_name[_addr];
    }
    
    function add_message(string _chat_room, string _message) public {
        uint _chat_count= chats_per_room[_chat_room];
        Chat_object storage new_chat_obj = All_chats[_chat_room][_chat_count];
        new_chat_obj._id = _chat_count;
        new_chat_obj._name = address_to_name[msg.sender];
        new_chat_obj._time = now;
        new_chat_obj._message = _message;
        New_chat_message(_chat_room, new_chat_obj._name, _chat_count, _message, new_chat_obj._time );
        _chat_count++;
        chats_per_room[_chat_room] = _chat_count;
    }
    
    function get_message_for_room(string _room, uint _id) constant public returns (uint, string, uint, string, string){
        return (All_chats[_room][_id]._id, All_chats[_room][_id]._name, All_chats[_room][_id]._time, All_chats[_room][_id]._message, _room);
    }
    
    function add_address_to_private_room(uint _id, address _addr) public returns(bool){
        Room_object storage _ro = room_array[_id];
        if(_ro._addr_of_creator == msg.sender){
            _ro._alowed_if_not_public.push(_addr);
        }else{
            return false;
        }
    }
    function get_allowed_addr_per_room_id(uint _id) public view returns(address[]){
        Room_object memory _ro = room_array[_id];
        address[] memory _fake;
        
        for (uint x = 0 ; x< _ro._alowed_if_not_public.length; x++ ){
            if(_ro._alowed_if_not_public[x] == msg.sender){
                return _ro._alowed_if_not_public;
            }
        }
        return _fake;
    }
}