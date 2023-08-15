import React from "react";
import { Link} from 'react-router-dom';
import {GiTalk} from 'react-icons/Gi';
import {FaShoppingCart} from 'react-icons/Fa';
import {SlSocialGithub} from 'react-icons/Sl';
import {BsPeopleFill} from 'react-icons/Bs';
import {MdPhonelinkSetup} from 'react-icons/Md';

const Navbar = () => {
  return (
        <div className="flex flex-col justify-between">
            <Link to="/" className='my-2'>
                <GiTalk className='text-3xl flex-item' />
            </Link>
            <Link to="/friend" className="my-2">
                <BsPeopleFill className="text-3xl flex-item" />
            </Link>
            <Link to="/social" className="my-2">
                <SlSocialGithub className="text-3xl flex-item" />
            </Link>
            <Link to="/shop" className="my-2">
                <FaShoppingCart className="text-3xl flex-item" />
            </Link>
            <Link to="/setting" className="my-2">
                <MdPhonelinkSetup className="text-3xl flex-item" />
            </Link>
        </div>
  );
};

export default Navbar;
