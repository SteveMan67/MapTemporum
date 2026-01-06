node_keys = {"place"}

function node_function()
    if Find("place") then 
        Layer("place", false)
        Attribute("name", Find("name"))
        MinZoom(0)
    end
    print(json.encode(AllKeys()))
end

function way_function() 
    if Find("natural") == "water" then
        Layer("water_areas", true)
        AttributeNumeric("area", Area())
        MinZoom(0)
    end
end
