import { Image, TouchableOpacity } from "react-native";

import BackIcon from  '@/assets/images/icons/backicon.png'

export default function BackButton(){
    return(
        <TouchableOpacity>
            <Image source={BackIcon} width={30} height={30}/>
        </TouchableOpacity>
    )
}