import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';

const API = "http://127.0.0.1:8000/api";

function Button({ text, handleButtonClick }) {
  return (
    <>
      <div
        onClick={()=>{handleButtonClick()}}
        className=" 
            bg-white select-none
            shadow-xl border border-gray-200 rounded-full h-10 w-40
            flex justify-center items-center
            hover:bg-gray-100 active:bg-gray-300


            "
      >
        {text}
      </div>
    </>
  );
}


function CreateCategoryForm({ onButtonClick }) {
    const [categoryName, setCategoryName] = useState("")


    const create_category = async () => {
        const res = await fetch(`${API}/create_category/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: categoryName
            })
        })
        const created_category = await res.json()
        console.log("THIS IS THE RESPONSE", created_category)

    }



    const button_click = () => {
        onButtonClick()
        create_category()
    }




  return (
    <>
      <div
        className="w-100 border border-gray-300 p-5
                rounded shadow-xl bg-white
                justify-center items-center">
            <div className=" flex flex-col mb-4">
                {categoryName}
                <TextField 
                onChange={(e)=>{setCategoryName(e.target.value)}}
                id="outlined-basic" label="Name" variant="outlined" />
            
            </div>
            <div
                className="w-full flex justify-center items-center"
                >
                <Button 
                handleButtonClick={button_click}
                text={"Create"} />
            </div>
      </div>
    </>
  );
}









export default function IdeaBinV2() {
    const [categories, setCategories] = useState({});
    const [displayForm, setDisplayForm] = useState(false)



  const fetch_categories = async () => {
    const res = await fetch(`${API}/get_all_categories/`);
    const categories = await res.json();
    console.log("categories received: ", categories.categories);
    const all_categories = categories.categories

    const serialized_categories = {}
    for (let i = 0; i < all_categories.length; i ++ ){
        const category = all_categories[i]
        // console.log("Index: ", i)
        // console.log("category: ", category)
        serialized_categories[category.id] = {
            name: category.name, 
            x: category.x,
            y: category.y,
            width: category.width,
            height: category.height,
        }
    }

    // console.log("serialized categories objects: ", serialized_categories)
    setCategories(serialized_categories)
  };

  useEffect(() => {
    fetch_categories()
  }, []);

  
  const handleCategoryDrag = (event, category_key) => {
    const category = categories[category_key]
    console.log("category: ", category.x)
    
    const startX = event.clientX - category.x
    const startY = event.clientY - category.y

    const onMouseMove = (e) => {
        const new_x = e.clientX - startX
        const new_y = e.clientY - startY

        setCategories((prev)=>{
            return ({
                ...prev, 
                [category_key]: {
                    ...prev[category_key],
                    x: new_x, 
                    y: new_y
                }
            })
        })
    }
    const onMouseUp = () => {

        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }












  return (
    <>
      <div className="h-screen w-screen p-10 flex justify-center items-center select-none">
        <div 
        style={{
            display: displayForm ? "block" : "none" 
        }}
        className="fixed z-2"><CreateCategoryForm onButtonClick={()=>{setDisplayForm(false)}}/></div>

        {/* Overlay */}
        <div 
        style={{
            display: displayForm ? "block" : "none" 
        }}
        className="h-full w-full fixed bg-black/40 z-1"></div>

        <div className="h-full w-full bg-white shadow-2xl border border-gray-300 rounded flex">
          <div className="w-1/4 h-full shadow-xl bg-gray-200 border border-gray-200"></div>

          {/* Category Side */}
          <div className="w-3/4 h-full shadow-xl border border-gray-200 relative">

            {/* Catgory Displays */}
            {Object.entries(categories).map(([category_key, category_data])=>{
                // console.log("key", category_key)
                // console.log("value", category_data)
                return (
                    <div
                    onMouseDown={(e)=>{handleCategoryDrag(e, category_key)}}
                    style={{
    left: category_data.x,
    top: category_data.y,
    width: category_data.width,
    height: category_data.height,
}}

                    key={category_key}
                    className="absolute bg-yellow-200 shadow-xl rounded"
                    >
                        {category_data.name}
                    </div>
                )

            })}


            {/* Button */}
            <div 
            onClick={()=>{setDisplayForm(true)}}
            className="absolute top-5 right-5 ">
              <Button 
              text={"Create Category"} 
              handleButtonClick={()=>setDisplayForm(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
