import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ServiceCard from "./ServiceCard"; // Ensure this can handle items from the API response
import ServiceModal from "./ServiceModal";
import { Spinner } from "@telegram-apps/telegram-ui";
import FooterFlex from "../FooterFlex/FooterFlex";
import Example from "../Example";
import { Link, Element } from "react-scroll"; // Import from react-scroll
import { FiAlignJustify } from "react-icons/fi";
import axios from "axios";

const Services = () => {
  const [services, setServices] = useState([]); // This will hold the categories from the API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubcategory, setActiveSubcategory] = useState(null); // State to track active subcategory
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility

  const ulRef = useRef(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category") || "All";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.post("https://menuapp.ru/api/v1");
        setServices(data.categories); // Assuming the API returns an object with a `categories` array
      } catch (err) {
        setError("Failed to load services.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory !== "All") {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const scrollToButton = (category) => {
    const button = document.getElementById(`btn-${category}`);
    if (button && ulRef.current) {
      const ulRect = ulRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const scrollPosition =
        buttonRect.left -
        ulRect.left +
        ulRef.current.scrollLeft -
        ulRect.width / 2 +
        buttonRect.width / 2;

      ulRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });

      setActiveCategory(category);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.id;
            if (categoryId !== activeCategory) {
              setActiveCategory(categoryId);
              scrollToButton(categoryId);
            }
          }
        });
      },
      {
        threshold: 0.7,
      }
    );

    services.forEach((category) => {
      const categoryElement = document.getElementById(category.title);
      if (categoryElement) {
        observer.observe(categoryElement);
      }
    });

    return () => {
      services.forEach((category) => {
        const categoryElement = document.getElementById(category.title);
        if (categoryElement) {
          observer.unobserve(categoryElement);
        }
      });
    };
  }, [services, activeCategory]);

  const handleCardClick = (item) => {
    setActiveItem(item);
    setIsModalOpen(true);
  };

  // Function to handle dropdown toggle on hover
  const handleMouseEnter = (categoryTitle) => {
    setActiveSubcategory(categoryTitle);
  };

  const handleMouseLeave = () => {
    setActiveSubcategory(null);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ulRef.current && !ulRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setActiveSubcategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[100%]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="rounded-t-[40px] relative z-[11] mt-[-31px] bg-[#eee]">
      <Example service={services} onClick={handleCardClick} />
      <div className="container relative jawdat">
        <div className="flex z-[1000] items-center top-0 h-16 sticky inset-x-0 bg-[#eee] rounded-b-[20px] pl-3">
          <ul ref={ulRef} className="flex space-x-4 overflow-x-auto">
            {services.map((category) => (
              <li key={category.id} className="flex relative">
                <Link
                  id={`btn-${category.title}`}
                  to={category.title}
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-40}
                  onSetActive={() => scrollToButton(category.title)}
                  className={`px-4 w-[max-content] py-2 block text-sm font-medium rounded-full transition-all duration-300 ${
                    activeCategory === category.title
                      ? "active font-bold bg-primary text-white"
                      : "text-gray-700"
                  }`}
                 
                >
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="relative">
            <button
              className="mx-[6px] px-4 py-2 text-sm font-medium bg-[#ffc001] text-white rounded-full transition-all duration-300 active:bg-primary active:opacity-50 focus:outline-none"
              onClick={handleDropdownToggle}
            >
              <FiAlignJustify />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-[40px] right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-[1002]">
                <ul ref={ulRef} className="flex flex-col space-y-2 p-2">
                  {services.map((category) => (
                    <li key={category.id}>
                       <Link
                  id={`btn-${category.title}`}
                  to={category.title}
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-40}
                  onSetActive={() => scrollToButton(category.title)}
                  className={`px-4 w-[max-content] py-2 block text-sm font-medium rounded-full transition-all duration-300 ${
                    activeCategory === category.title
                      ? "active font-bold bg-primary text-white"
                      : "text-gray-700"
                  }`}
                 
                >
                  {category.title}
                </Link>
                      {/* Render dropdown for subcategories only if they exist */}
                     
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex z-[1000] items-center top-0 h-16 sticky inset-x-0 bg-[#eee] rounded-b-[20px] pl-3">
  <ul ref={ulRef} className="flex space-x-4 overflow-x-auto">
        {services.map((category) => (
      <li key={category.id} className="relative">
        {/* Render the category title */}
        <Link
          id={`btn-${category.title}`}
          to={category.title}
          spy={true}
          smooth={true}
          duration={500}
          offset={-40}
          onSetActive={() => scrollToButton(category.title)}
          className={`px-4 py-2 block text-sm font-medium rounded-full transition-all duration-300 ${
            activeCategory === category.title
              ? "active font-bold bg-primary text-white"
              : "text-gray-700"
          }`}
        >
          {category.title}
        </Link>

        {/* Render items or subcategories within each category */}
        <ul className="space-y-2 mt-2">
          {category.items.length > 0 ? (
            category.items.map((item) => (
              <li key={item.id}>
                <ServiceCard
                  service={item} // Render each item in ServiceCard
                  onClick={() => handleCardClick(item)}
                />
              </li>
            ))
          ) : (
            category.subcategories &&
            category.subcategories.map((subcategory) => (
              <li key={subcategory.id}>
                {/* Render subcategory title */}
                <Link
                  id={`btn-${subcategory.title}`}
                  to={subcategory.title}
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-40}
                  onSetActive={() => scrollToButton(subcategory.title)}
                  className={`block py-2 text-sm rounded-full transition-all duration-300 ${
                    activeSubcategory === subcategory.title
                      ? "font-bold text-primary"
                      : "text-gray-700"
                  }`}
                >
                  {subcategory.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </li>
    ))}
  </ul>
</div>



        <div className="grid gap-4 p-4 pb-[100px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative">
          {services.map((category) => (
            <Element
              key={category.id}
              name={category.title}
              className="category-section"
              id={category.title}
            >
              <h1 className="text-lg text-center my-[20px] font-bold">
                {category.title}
              </h1>
              {/* Render items or subcategories */}
              {category.items.length > 0 ? (
                category.items.map((item) => (
                  <ServiceCard
                    key={item.id}
                    service={item} // Update to use item from API response
                    onClick={() => handleCardClick(item)}
                  />
                ))
              ) : (
                category.subcategories &&
                category.subcategories.map((subcategory) => (
                  <div key={subcategory.id}>
                    {/* Check if subcategory has items */}
                    {subcategory.items && subcategory.items.length > 0 && (
                      <div>
                        <h2 className="text-md text-center my-4 font-semibold">
                          {subcategory.title}
                        </h2>
                        {subcategory.items.map((item) => (
                          <ServiceCard
                            key={item.id}
                            service={item} // Update to use item from API response
                            onClick={() => handleCardClick(item)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </Element>
          ))}

        </div>

        <ServiceModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          service={activeItem}
        />

        <FooterFlex />
      </div>
    </div>
  );
};

export default Services;
