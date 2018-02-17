pragma solidity ^0.4.18;

contract BlockChat{
    uint room_count=0;
    string[] room_array;
    
    mapping (string=> mapping (uint=>Chat_object)) All_chats;
    mapping (address=>string) address_to_name;
    mapping (string=>uint) chats_per_room;

    event User_joined(string _name);
    event New_chat_room_created(string _room, address _addr);
    event New_chat_message(string _room, string _name, uint _id_index, string _message);
    
    
    struct Chat_object{
        uint _id;
        string _name;
        uint _time;
        string _message;
    }

    function get_room_count() constant public returns (uint){
        return room_count;
    }
    
    function add_new_chatroom(string _room) public{
        require(chats_per_room[_room] < 1);
        chats_per_room[_room] = 0;
        room_array.push(_room);
        room_count++;
        New_chat_room_created(_room, msg.sender);
        
    }

    function get_room_by_index (uint _index) constant public returns(string) {
        return room_array[_index];        
    }
    
    
    function get_chat_room_chat_count(string _chat_room) constant public returns (uint){
        return chats_per_room[_chat_room];
    }
    
    function add_name(string _name) public{
        address_to_name[msg.sender] = _name;
        User_joined(_name);
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
        New_chat_message(_chat_room, new_chat_obj._name, _chat_count, _message );
        _chat_count++;
        chats_per_room[_chat_room] = _chat_count;
        


    }
    
    function get_message_for_room(string _room, uint _id) constant public returns (uint, string, uint, string){
        return (All_chats[_room][_id]._id, All_chats[_room][_id]._name, All_chats[_room][_id]._time, All_chats[_room][_id]._message);
    } 
        
    
}